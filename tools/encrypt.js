/*
 *
 * author : ShinIng
 * date	  : 2015.11.18
 *
 */

var crypto = require('crypto');


exports.md5 = function(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};
