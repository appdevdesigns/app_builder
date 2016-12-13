steal(
	// Dependencies
	"opstools/BuildApp/tests/stubHelper.js",
	"opstools/BuildApp/controllers/utils/DataCollectionHelper.js",
	function (abStubHelper, dataCollectionHelper) {

		//Define the unit tests
		describe('testing DataCollectionHelper utility ', function () {

			var appInfo = {
				id: 1,
				name: 'TEST_application'
			};

			before(function (done) {

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

			after(function () {
				dataCollectionHelper.modelCreator.getModel.restore();
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
					newPet.attr('Owner', 1);
					newPet.save()
						.then(function (result) {
							petDC.AD.__list.push(result);

							// Assert
							ownerDC.find({}).forEach(function (owner) {
								if (owner.id == 1)
									assert.equal(1, owner.Pet.filter(function (p) { return p.id == newPetId; }).length);
								else
									assert.equal(0, owner.Pet.filter(function (p) { return p.id == newPetId; }).length);
							});

							setTimeout(done, 1300);
						});
				});

				it('should update parent data when child data is updated', function (done) {
					console.log('-- Unit test 1:M update child data --');

					var updateTasks = [];

					petDC.find({}).forEach(function (pet, index) {
						updateTasks.push(function (ok) {
							// Update Owner of pet data
							petDC.setCursor(pet.id);
							var petModel = petDC.AD.currModel();
							petModel.attr('Owner', 2);

							petModel.save().fail(ok)
								.then(function () { ok(); });
						});
					});

					async.series(updateTasks, function () {
						setTimeout(function () {
							// Assert
							ownerDC.find({}).forEach(function (owner) {
								if (owner.id == 2)
									assert.equal(petDC.count(), owner.Pet.length, 'should have pets in owner ID: 2');
								else
									assert.equal(0, owner.Pet.length, 'should not have this pet in owner ID: ' + owner.id);
							});

							done();
						}, 501);
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
									// Assert
									assert.equal(newPetId, result.id, 'should be new pet id');

									petDC.AD.__list.push(result);
									ok();
								});
						},
						function (ok) {
							newOwner.attr('id', newOwnerId);
							newOwner.attr('name', 'New Owner');
							newOwner.attr('Pet', [newPetId]);
							newOwner.save().fail(ok)
								.then(function (result) {
									// Assert
									assert.equal(newOwnerId, result.id, 'should be new owner id');

									ownerDC.AD.__list.push(result);
									ok();
								});
						}
					], function (err) {
						setTimeout(function () {
							// Assert
							assert.equal(1, ownerDC.find({ id: newOwnerId })[0].Pet.filter(function (p) { return (p.id || p) == newPetId }).length, 'the new owner should have a pet');
							assert.equal(newOwnerId, petDC.find({ id: newPetId })[0].Owner.id, 'owner data of pet should be the new onwer');

							done(err);
						}, 501);
					})
				});

				it('should update child data when parent data is updated', function (done) {
					var updateTasks = [],
						updatePetIds = [1, 2, 3];

					// Update Owner of pet data
					ownerDC.setCursor(1);
					var ownerModel = ownerDC.AD.currModel();
					ownerModel.attr('Pet', updatePetIds);

					ownerModel.save().fail(done)
						.then(function (result) {
							// Assert
							assert.equal(3, result.Pet.length, 'this owner should have 3 pets');
							assert.equal(3, petDC.find(function (p) { return p.Owner.id == ownerModel.id; }).length, 'should have this owner in pet data');

							updatePetIds.forEach(function (petId) {
								assert.equal(1, result.Pet.filter(function (p) { return p == petId; }).length);
							});

							done();
						});
				});

				it('should update child data when parent data is updated to empty child data', function (done) {
					var updateTasks = [];

					ownerDC.find({}).forEach(function (owner) {
						updateTasks.push(function (ok) {
							// Update Owner of pet data
							ownerDC.setCursor(owner.id);
							var ownerModel = ownerDC.AD.currModel();
							ownerModel.attr('Pet', []);

							ownerModel.save().fail(ok)
								.then(function () { ok() });
						});
					});

					async.series(updateTasks, function (err) {
						setTimeout(function () {
							ownerDC.find({}).forEach(function (owner) {
								// Assert
								assert.equal(0, petDC.find(function (p) { return p.Owner && p.Owner.id == owner.id; }).length, 'should not have this owner in pet data');
							});

							done(err);
						}, 501);
					});
				});

				it('should update child data when parent data is deleted', function (done) {
					var deleteTasks = [];

					ownerDC.find({}).forEach(function (owner) {
						deleteTasks.push(function (ok) {
							ownerDC.AD.destroyModel(owner.id)
								.fail(ok)
								.then(function () {
									// Assert
									assert.equal(0, petDC.find(function (pet) { return pet.Owner && pet.Owner.id == owner.id; }).length, 'should not have deleted owner in pet data');

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