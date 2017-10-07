module.export = function () {
    var validator = require('validator');
    var request   = require('request');
    var utf8      = require('utf8');

    /*
     * StopForumSpam Module
     * @exports stopforumspam
     * @namespace sfs
     */
    var sfs = {}

    /*
     * Default Configuration settings for stopforumspam
     */
    var options = {
        apiKey: '',
        searchParameters: [{
            name: 'ip',
            submit: 'ip_addr'
        },{
            name: 'email',
            submit: 'email'
        },{
            name: 'username',
            submit: 'username'
        }]
            name: 'emailhash'
        },{
    };

    /*
     * Creates a user object to utilize the API in a more human manner
     *
     * @memberOf sfs
     * @namespace User
     *
     * @param userObject {object} an object with the params to search for
     *    ip {string} the ip address of the user
     *    email {string} the email address of the user
     *    emailhash {string} a md5 hash of the email address of the user
     *    username {string} the username of the user
     *
     * @throws throws an error if the email, email hash or IP is passed and invalid.
     */
    sfs.user = function (userObject) {
        if (!!userObject.email && !validator.isEmail(userObject.email)) {
            throw new Error('The email address is not a valid email address ' + userObject.email);
        }
        if (!!userObject.ip && !validator.isIP(userObject.ip)) {
            throw new Error('The IP address is not a valid IP address ' + userObject.ip);
        }
        if (!!userObject.emailhash && !validator.isHash(userObject.emailhash, 'md5')) {
            throw new Error('The email hash is not a valid MD5 hash ' + userObject.emailhash);
        }
        return userObject;
    };

    /*
     * Checks if a user is a spammer.
     * Pass only the parameters you wish to search for
     * No checks for validity of ip, email or emailhash
     * Use sfs.User instead for checking those.
     *
     * @param userObject {object} a hashlike object with each of the  parameters to search for.
     *    Search for as many or as few as you wish.
     * @param callback {function} a callback function to return.
     *
     * @example
     * var user = sfs.user({ ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' });
     * sfs.isSpammer(user, callback);
     * function callback(result) {
     *   // result = {
     *   //   success: 1,
     *   //   username: {
     *   //     lastseen: '2015-03-09 15:22:49',
     *   //     frequency: 3830,
     *   //     appears: 1,
     *   //     confidence: 90.2
     *   //   }
     *   // }
     * }
     *
     * @returns JSON object with StopForumSpam.com response
     *
     * @throws throws any error it receives from the response, including status codes that are not 200
     */
    sfs.isSpammer = function (userObject, callback) {
        var url = "https://api.stopforumspam.org/api";
        var form = {
            json: true,
            nobadusername: true
        };

        options.searchParameters.forEach(function (parameter) {
            if (!!userObject[parameter.name]) {
                form[parameter.name] = encodeURIComponent(utf8.encode(userObject[parameter.name]));
            }
        });

        request.post({url, form}, function (error, response, body) {
            if (error) {
                return callback(error);
            }
            if (response.statusCode !== 200) {
                return callback(new Error('Response Status: ' + response.statusCode + ', ' + body));
            }
            var result = false;
            var jsBody = JSON.parse(body);

            options.searchParameters.forEach(function (parameter) {
                if (!!userObject[parameter.name] && !!jsBody[parameter.name]) {
                    result = JSON.parse(body);
                }
            });
            callback(result);
        });
    };

    /*
     * Submits the user to StopForumSpam.com under your API key
     * Requires options.apiKey to be set
     *
     * @param userObject must contain properties for each searchParameter
     *   empty parameters will throw an error
     *
     * @example
     * sfs.key('some-api-key');
     * var user = sfs.user({ ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' });
     * sfs.submit(user, 'Caught You!');
     *
     * @param userObject {object} the user details, emailhash is ignored
     * @param evidence {string} (optional) you can tell StopForumSpam.com your reasoning if you like
     * @param callback {function} a callback function to return.
     *
     * @returns true if submission was successful, else Error
     *
     * @throws throws an error if you have not set the API key
     * @throws throws an error if you don't pass a user object with all of the parameters
     *   (ip, email, & username)
     * @throws throws any error it recieves from the response, including status codes that are not 200
     */
    sfs.submit = function (userObject, evidence, callback) {
        if (!options.apiKey) {
            return callback(new Error('You cannot submit spammers without an API Key.'));
        }

        var url = 'https://www.stopforumspam.com/add';
        var error = false;
        var form = {
            api_key: options.apiKey
        };

        options.searchParameters.forEach(function (parameter) {
            if (parameter.name !== 'emailhash') {
                if (!userObject[parameter.name]) {
                    error = true;
                }
                else {
                    form[parameter.submit] = encodeURIComponent(utf8.encode(userObject[parameter.name]));
                }
            }
        });

        if (error) {
            callback(new Error('You must have all search parameters for StopForumSpam.com to accept your submission.'));
        }
        else {
            if (evidence) {
                // unescape in JS is a simple way to convert to UTF-8, which StopForumSpam requires
                form.evidence = encodeURIComponent(utf8.encode(evidence));
            }

            request.post({url, form}, function (error, response, body) {
                if (error) {
                    return callback(error);
                }
                if (response.statusCode !== 200) {
                    return callback(new Error('Response Status: ' + response.statusCode + ', ' + body));
                }

                callback(true);
            });
        }
    };

    /*
     * Getter & Setter for the API Key
     * @param key {string} The API Key for StopForumSpam.com
     *    Necessary for submitting users to the database.
     *    Unset it with an empty string or false.
     * @returns {string} The current API Key as it is set 
     */
    sfs.key = function(key) {
        if (key !== undefined) {
            options.apiKey = key;
        }

        return options.apiKey;
    };

    return sfs;
}
