# StopForumSpam

A nodejs wrapper for the [StopForumSpam.com][sfs] API

All requests are done with POST through HTTPS for enhanced privacy.

Code based on <https://github.com/deltreey/stopforumspam>

## Usage

```js
var sfs = require('stopforumspam');

// Creating a user is not necessary, but it's a good idea to validate your parameters
// The IP can be either IPv4 or IPv6
var sfsUser = sfs.user({ip: '127.0.0.1', email: 'test@test.com', username: 'testUserName');

// Then you can check the sfs.com database easily.
sfs.isSpammer(sfsUser, callback);

function callback (result) {
    /*
    result = {
        success: 1,
        username: {
            lastseen: '2015-03-09 15:22:49',
            frequency: 3830,
            appears: 1,
            confidence: 90.2
        }
    }
    */
}

// You can easily submit them if they're spammers too.
sfs.key('my-api-key');
sfs.submit(sfsUser, 'This text is an optional way to tell SFS why you submitted the user.', callback);

// As said, there's no need to create a user.  For example:
sfs.isSpammer({ip: '127.0.0.1', email: 'test@test.com', username: 'Spammer!'}, callback);
// Just notice that no validity checks are done this way so you must be sure your data is correct.

// You don't need to search with every parameter.  You can search only for one or two if you like.
sfs.isSpammer({ip: '123.456.789.100'}, callback);

// You can also send a MD5 hash of the email if you are concerned of your users privacy.
sfs.isSpammer({emailhash: 'c8d86ad5ed1add319e802f7f659df166'}, callback);
// Or you can also only send the domain of the email
sfs.isSpammer({email: 'test.com'}, callback);
```

## License

MIT © [André Zanghelini](https://github.com/An-dz)
MIT © [Ted](https://github.com/deltreey)

[sfs]: http://stopforumspam.com
