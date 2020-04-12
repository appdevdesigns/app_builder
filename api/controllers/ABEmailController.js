/**
 * ABEmailController
 *
 * @description :: Server-side logic for managing Ablists
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
   /* Email */

   /**
    * POST /app_builder/email
    *
    * Send a email to recipients
    */
   send: function(req, res) {
      // Check opstools-emailNotification project is not included.
      if (!EmailNotifications) {
         res.AD.error("Email notification is not exist");
         return;
      }

      EmailNotifications.send({
         notify: {
            // id: TODO
            emailSubject: req.body.subject,
            fromName: req.body.fromName,
            fromEmail: req.body.fromEmail
         },
         recipients: req.body.recipients,
         body: req.body.message
      })
         .fail(res.AD.error)
         .then(function() {
            res.AD.success(true);
         });
   }
};
