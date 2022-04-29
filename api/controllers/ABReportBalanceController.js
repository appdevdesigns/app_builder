const OBJECT_IDS = {
   FY_MONTH: "1d63c6ac-011a-4ffd-ae15-97e5e43f2b3f",
   ACCOUNT: "c1a3642d-3863-4eb7-ac98-3dd18de3e683",
   BALANCE: "bb9aaf02-3265-4b8c-9d9a-c0b447c2d804"
};

module.exports = {
   // GET: /template/balanceSheet
   getData: function(req, res) {
      let viewData = {
         fyPeriod: req.query.month,
         fyOptions: []
      };

      Promise.resolve()
         // Pull FY month list
         .then(
            () =>
               new Promise((next, err) => {
                  const objFYMonth = ABSystemObject.getApplication().objects(
                     (o) => o.id == OBJECT_IDS.FY_MONTH
                  )[0];

                  if (objFYMonth == null) {
                     next();
                     return;
                  }

                  objFYMonth
                     .modelAPI()
                     .findAll({
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: "Status",
                                 rule: "equals",
                                 value: "1592549786113"
                              }
                           ]
                        },
                        populate: false,
                        sort: [
                           {
                              key: "49d6fabe-46b1-4306-be61-1b27764c3b1a",
                              dir: "DESC"
                           }
                        ],
                        limit: 12
                     })
                     .then((list) => {
                        viewData.fyOptions = list.map((item) => {
                           return {
                              id: item.uuid,
                              value: item["FY Per"]
                           };
                        });
                        next();
                     })
                     .catch(err);
               })
         )
         // Pull report data
         .then(
            () =>
               new Promise((next, err) => {
                  const objBalance = ABSystemObject.getApplication().objects(
                     (o) => o.id == OBJECT_IDS.BALANCE
                  )[0];

                  if (objBalance == null || viewData.fyPeriod == null) {
                     viewData.balance = {};
                     next();
                     return;
                  }

                  objBalance
                     .modelAPI()
                     .findAll({
                        where: {
                           glue: "and",
                           rules: [
                              {
                                 key: "FY Period",
                                 rule: "equals",
                                 value: viewData.fyPeriod
                              }
                           ]
                        },
                        populate: true
                     })
                     .then((list) => {
                        console.log("Praise the Lord: ", list[0]);
                        next();
                     })
                     .catch(err);

                  next();
               })
         )
         // Render UI
         .then(() => {
            res.view(
               "app_builder/template/balanceSheet", // .ejs
               viewData
            );
         });
   }
};
