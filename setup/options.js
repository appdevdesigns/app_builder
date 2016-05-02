/**
 * This file specifies any commands for setting up the plug-in in a sails
 * environment.
 *
 * You have 2 ways of modifying the behavior of the setup process.  Method 1
 * is by overriding the default settings of the given actions: directories,
 * links, dirLinks, etc...  and placing the values you want to be there.
 *
 * The other method is to leave the default behavior of the setup routine,
 * but list individual files that should be ignored in the process.  Look in
 * the ignore:{} setting for those.
 *
 */
module.exports = {
/*

     // list any directories that need to be created in the base sails path
     directories:[
         '/data/[moduleName]'
     ],


    // list any files to copy into sails directory:
    // paths assume they are relative to the [plugin] and [sails] roots:
    // you can rename the file as well:
    copyFiles: {
        // [plugin/path/to/File] :  [sails/path/to/file]
        // 'config/specialConfig.js':'config/specialConfig.js',
        // 'config/specialConfig2.js': config/differentName.js'
    },


     // list the directories to create symbolic links to:
     //     format:  [desiredSailsDir] : [current/plugin/dir]
     links:{
         'api/models/[moduleName]' : 'api/models'
     },


     // List the directories that contain files that need to become linked
     // to in Sails
     dirLinks:[
         // '/module/dir',    // ==> sails/module/dir
         'api/services',
         'api/policies',
         'config'
     ],


     // List the sails files that need to be patched:
     //     path:   [string]  the sails path to the file
     //     append: [bool]    simply append our text data?
     //     tag:    [string]  if append=false, then look for this tag and replace it with text
     //     text:   [string]  the text to append/insert into the specified file
     patches:[

         { path:'config/routes.js', append:true,  text:'require(\'[moduleName]\').routes(routes);\n' },
         { path:'config/policies.js', append:true, text:'require(\'[moduleName]\').policies(policies);\n'},

     ],


     // list the files that should be added to the above defaults
     additions:{

        // ex: create a [sailsRoot]/data/[moduleName]/templates_email/  -> [pluginDir]/data/templates_email
        links:{
            'data/[moduleName]/templates_email': 'data/templates_email'  
        }
    },


     // list the files that should be excluded from the above default actions
     // if you want to keep
     ignore:{


        // do any of the above files that get linked to in dirLinks need to be ignored?
        dirLinks:{
            // "path/to/file.js": 1
            "/config/ignoreFile.js":1
        },

        // this is the default config/local.js  merge with all the non standard config files
        // in your config directory.  If you don't want one of those files merged into
        // config/local.js, then list the file name here.  It needs to be a key in the object
        // definition.
        configLocal:{
            'opsportal.js':1    // don't include our config/opsportal.js file in our config/local.js mash up
        }
    }

 */

};