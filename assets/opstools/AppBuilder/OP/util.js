export default {
   uuid: AD.util.uuid,
   isUuid: (key) => {
      var checker = RegExp(
         "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
         "i"
      );
      return checker.test(key);
   }
};
