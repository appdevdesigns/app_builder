steal(
	// Dependencies
	"opstools/BuildApp/tests/stubHelper.js",
	"opstools/BuildApp/controllers/utils/DataCollectionHelper.js",
	function (abStubHelper, dataCollectionHelper) {

		// the div to attach the controller to
		var divID = 'test_DataCollectionHelper';

		// add the div to the window
		var buildHTML = function () {
			var html = [
				'<div id="' + divID + '">',
				'</div>'
			].join('\n');

			$('body').append($(html));
		}

		//Define the unit tests
		describe('testing DataCollectionHelper utility ', function () {

			var appInfo = {
				id: 1,
				name: 'TEST_application'
			};

			before(function (done) {

				buildHTML();

				async.series([
					function (next) {
						abStubHelper.getMockModel('ABObject').findAll({})
							.then(function (result) {
								appInfo.objects = result;
								next();
							});
					},
					function (next) {
						// Stub ModelCreator
						sinon.stub(dataCollectionHelper.modelCreator, 'getModel', function (application, objectName) {
							// get Mock model
							return abStubHelper.getMockModel(objectName);
						});

						next();
					}
				], done);
			});

			it('should return data collection of object data', function (done) {
				var objectId = appInfo.objects[0].id;

				dataCollectionHelper.getDataCollection(appInfo, objectId)
					.fail(function (err) {
						assert.fail(err, undefined, 'should not return any error');

						done();
					})
					.then(function (dataCollection) {
						assert.isOk(dataCollection);

						done();
					});
			});

			describe('test 1:M connect data', function () {
				var ownerObjectId = 1,
					ownerObjectName = 'Owner',
					ownerDC,
					petObjectId = 2,
					petObjectName = 'Pet',
					petDC;

				beforeEach(function (done) {
					// Refresh data collections
					async.series([
						// Get parent data collection
						function (next) {
							abStubHelper.clearModel(ownerObjectName);
							dataCollectionHelper.getDataCollection(appInfo, ownerObjectId, true)
								.fail(next)
								.then(function (result) {
									ownerDC = result;
									next();
								});
						},
						// Get child data collection
						function (next) {
							abStubHelper.clearModel(petObjectName);
							dataCollectionHelper.getDataCollection(appInfo, petObjectId, true)
								.fail(next)
								.then(function (result) {
									petDC = result;
									next();
								});
						}
					], done);
				});

				it('should update parent data when add new child data', function (done) {
					console.log('-- Unit test 1:M add new child data --');

					var newPet = new petDC.AD.getModelObject()(),
						newPetId = 999;
					newPet.attr('id', newPetId);
					newPet.attr('Name', 'New Pet');
					newPet.attr('Owner', { id: 1 });
					newPet.save().fail(done)
						.then(function (result) {
							petDC.AD.__list.push(result);

							// Assert
							ownerDC.find({}).forEach(function (owner) {
								if (owner.id == 1)
									assert.equal(1, owner.Pet.filter(function (p) { return p.id == newPetId; }).length);
								else
									assert.equal(0, owner.Pet.filter(function (p) { return p.id == newPetId; }).length);
							});

							done();
						});
				});

				it('should update parent data when child data is update', function (done) {
					console.log('-- Unit test 1:M update child data --');

					var updateTasks = [];

					petDC.find({}).forEach(function (pet) {
						updateTasks.push(function (ok) {
							// Update Owner of pet data
							petDC.setCursor(pet.id);
							var petModel = petDC.AD.currModel();
							petModel.attr('Owner', { id: 2 });

							petModel.save().fail(ok)
								.then(function () { ok(); });
						});
					});

					async.series(updateTasks, function () {
						// Assert
						ownerDC.find({}).forEach(function (owner) {
							if (owner.id == 2)
								assert.equal(petDC.count(), owner.Pet.length, 'should have pets in owner ID: 2');
							else
								assert.equal(0, owner.Pet.length, 'should not have this pet in owner');
						});

						done();
					});
				});

				it('should remove data in parent when child data is deleted', function (done) {
					console.log('-- Unit test 1:M delete child data --');

					var deleteTasks = [];

					ownerDC.find({}).forEach(function (owner) {
						owner.Pet.forEach(function (pet) {

							deleteTasks.push(function (ok) {
								petDC.AD.destroyModel(pet.id)
									.fail(ok)
									.then(function () {
										// Assert
										assert.equal(0, owner.Pet.filter(function (p) { return p.id == pet.id }).length, 'should not have deleted pet in owner');

										ok();
									});
							});

						});
					});

					async.series(deleteTasks, done);
				});

				it('should update child data when add new parent data', function (done) {
					var newOwnerId = 999,
						newOwner = new ownerDC.AD.getModelObject()(),
						newPet = new petDC.AD.getModelObject()(),
						newPetId = 9999;

					async.series([
						function (ok) {
							newPet.attr('id', newPetId);
							newPet.attr('Name', 'New Pet');
							newPet.save().fail(ok)
								.then(function (result) {
									petDC.AD.__list.push(result);
									ok();
								});
						},
						function (ok) {
							newOwner.attr('id', newOwnerId);
							newOwner.attr('name', 'New Owner');
							newOwner.attr('Pet', [{ id: newPetId }]);
							newOwner.save().fail(ok)
								.then(function (result) {
									// Assert
									assert.equal(newOwnerId, result.id, 'should be new owner id');

									ownerDC.AD.__list.push(result);
									ok();
								});
						}
					], function (err) {
						if (err) {
							done(err);
							return;
						}

						// Assert
						assert.equal(1, ownerDC.find({ id: newOwnerId })[0].Pet.filter(function (p) { return p.id == newPetId }).length, 'the new owner should have a pet');
						assert.equal(newOwnerId, petDC.find({ id: newPetId })[0].Owner.id, 'owner data of pet should be the new onwer');

						done();
					})
				});

				it('should update child data when parent data is update', function (done) {
					var updateTasks = [];

					ownerDC.find({}).forEach(function (owner) {
						updateTasks.push(function (ok) {
							// Update Owner of pet data
							ownerDC.setCursor(owner.id);
							var ownerModel = ownerDC.AD.currModel();
							ownerModel.attr('Pet', []);

							ownerModel.save().fail(ok)
								.then(function () {
									// Assert
									assert.equal(0, petDC.find(function (p) { return p.Owner.id == owner.id; }).length, 'should not have this owner in pet data');

									ok();
								});
						});
					});

					async.series(updateTasks, done);
				});

				it('should update child data when parent data is deleted', function (done) {
					var deleteTasks = [];

					ownerDC.find({}).forEach(function (owner) {
						deleteTasks.push(function (ok) {
							ownerDC.AD.destroyModel(owner.id)
								.fail(ok)
								.then(function () {
									// Assert
									assert.equal(0, petDC.find(function (pet) { return pet.Owner.id == owner.id; }).length, 'should not have deleted owner in pet data');

									ok();
								});
						});
					});

					async.series(deleteTasks, done);
				});


			});
		});
	}
);