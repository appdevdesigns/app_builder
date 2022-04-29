const OBJECT_IDS = {
   FY_MONTH: "1d63c6ac-011a-4ffd-ae15-97e5e43f2b3f",
   ACCOUNT: "c1a3642d-3863-4eb7-ac98-3dd18de3e683",
   BALANCE: "bb9aaf02-3265-4b8c-9d9a-c0b447c2d804"
};

const ACCOUNT_CATEGORIES = {
   Assets: "1585806356532",
   Liabilities: "1585806356570",
   Equity: "1585806356643",
   Expenses: "1585806356789",
   Income: "1590392412833"
};

module.exports = {
   // GET: /template/balanceSheet
   getData: function(req, res) {
      let viewData = {
         fyPeriod: req.query.month,
         fyOptions: [],
         assets: [],
         liabilities: []
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
                        viewData.fyOptions = list.map((item) => item["FY Per"]);
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

                  viewData.assets = [];
                  viewData.liabilities = [];

                  if (objBalance == null || viewData.fyPeriod == null) {
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
                                 key: "549ab4ac-f436-461d-9777-505d6dc1d4f7",
                                 rule: "equals",
                                 value: viewData.fyPeriod
                              }
                           ]
                        },
                        populate: true
                     })
                     .then((list) => {
                        (list || []).forEach((bl) => {
                           if (
                              bl == null ||
                              bl.COANum__relation == null ||
                              bl.COANum__relation.Category == null
                           )
                              return;

                           const toDisplay = (item) => {
                              return {
                                 Title: item.COANum__relation["Acct Num"],
                                 Credit: item.Credit,
                                 Debit: item.Debit
                              };
                           };

                           switch (bl.COANum__relation.Category.toString()) {
                              case ACCOUNT_CATEGORIES.Assets:
                                 viewData.assets.push(toDisplay(bl));
                                 break;
                              case ACCOUNT_CATEGORIES.Liabilities:
                                 viewData.liabilities.push(toDisplay(bl));
                                 break;
                           }
                        });

                        // Fund Balance

                        next();
                     })
                     .catch(err);
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
