/*!
 * curious      Typechecking module
 * @author      Ryan Van Etten <@ryanve>
 * @link        github.com/ryanve/curious
 * @license     MIT
 * @version     0.3.1
 */

(function(root, name, definition) {
    if (typeof module != 'undefined' && module['exports']) module['exports'] = definition(); 
    else root[name] = definition();
}(this, 'curious', function() {

    var xports = {}
      , root = this
      , win = window
      , types = /function|object|string|number|boolean|undefined/
      , owns = xports.hasOwnProperty
      , toString = xports.toString;

    /**
     * @param   {*}      item    item to test
     * @param   {string} type    case-sensitive type to test for
     * @return  {boolean}
     * @example is(item, 'object')  # true for typeof "object"
     * @example is(item, 'Object')  # true for [object Object]
     * @example is(item, 'null')    # true if item === null
     */
    function is(item, type) {
        if (typeof item === type) return true; // object|function|undefined|number|boolean|string
        if (null == item || item !== item) return ('' + item) === type; // null|undefined|NaN
        return ('[object ' + type + ']') === toString.call(item); // Object|Array|RegExp|Date|...
    }
    xports['is'] = is;

    /**
     * @param  {*}  a
     * @param  {*=} b
     * @return {boolean}
     */
    function it(a, b) {
        // Emulate ES6 Object.is
        return a === b ? (0 !== a || 1/a === 1/b) : a !== a && b !== b;
    }

    /**
     * @param  {(string|*)=} type  a string type to test via `is` OR a value to compare.
     * @param  {boolean=}    inv   Invert the test by setting `inv` to `true`.
     * @return {Function}
     */
    function automateIs(type, inv) {
        inv = true === inv;
        return typeof type == 'string' ? types.test(type) ? function(o) {
            return (typeof o === type) != inv; 
        } : function(o) {
            return is(o, type) != inv; 
        } : function(o) {
            return it(o, type) != inv;
        };
    }
    is['automate'] = automateIs;

    // Use the native isArray when available.
    var isArray = xports['isArray'] = is['Array'] = Array.isArray || automateIs('Array');

    // is(item, 'Object') tests exactly for [object Object]
    // In modern browsers, that excludes the window. Ensure:
    var isObject = xports['isObject'] = is['Object'] = is(win, 'Object') ? function(item) {
        return item !== win && is(item, 'Object');
    } : automateIs('Object');
    
    var isArguments = xports['isArguments'] = is['Arguments'] = !is(arguments, 'Arguments') ? function(item) {
        return !!(item && owns.call(item, 'callee'));
    } : automateIs('Arguments');
    
    // ~ github.com/ded/valentine
    is['boo'] = automateIs('boolean');
    is['obj'] = automateIs('object');
    is['num'] = automateIs('number');
    is['str'] = automateIs('string');
    is['fun'] = xports['isFunction'] = automateIs('function');
    //is['und'] = xports['isUndefined'] = automateIs();
    is['und'] = automateIs();
    is['def'] = automateIs(void 0, true);
    
    // + oper coerces funcs and plain objs to NaN 
    xports['isNaN'] = is['nan'] = automateIs(+{});
    
    // ~ underscorejs.org
    // debating on whether or not to expose all of these
    xports['isRegExp'] = is['RegExp'] = is['reg'] = automateIs('RegExp');
    //xports['isNull'] = automateIs(null);
    //xports['isBoolean'] = automateIs('Boolean');
    //xports['isString'] = automateIs('String');
    //xports['isDate'] = automateIs('Date');
    //xports['isFunction'] = automateIs('Function');

    //is['root'] = automateIs(root);
    //is['noise'] = function (o) { 
    //    return o == null || o !== o; 
    //};

    function isRealNumber(o) {// "number" and finite
        return o ? typeof o == 'number' && o > (o - 1) : 0 === o; 
    }
    //is['real'] = isRealNumber;

    /**
     * @return {number|boolean}
     */
    function isNode(o) {
        return !!o && o.nodeType || false;
    }
    xports['isNode'] = is['node'] = isNode;
    
    function automateNode(n) {
        if (!(n > 0)) { throw new TypeError; }
        return function(o) {
            return !!o && n === o.nodeType;
        };
    }
    isNode['automate'] = automateNode;
    xports['isElement'] = is['elem'] = automateNode(1);
    
    /**
     * @param  {*} o
     * @param  {*} k
     * @return {boolean}
     */
    function has(o, k) {
        return owns.call(o, k);
    }
    //xports['has'] = has;
    
    /**
     * @return  {number|boolean}
     */
    function count(o) {
        if (typeof o != 'object' || !o || o.nodeType || o === win) return false;
        return typeof (o = o.length) == 'number' && o === o ? o : false;
    }
  
    /**
     * @return {*}  o
     * @return {boolean}
     */
    function isEmpty(o) {
        if (null == o)
            return true;
        if (typeof o != 'object')
            return '' === o;
        // hmm 
        if (0 === o.length) return o !== win;
         // vs: 
         // if (isArray(o) || isArguments(o)) return !o.length;
        for (var k in o)
            if (owns.call(o, k))
              return false;
        return true;
    }
    xports['isEmpty'] = is['emp'] = isEmpty;
    
    /**
     * @param  {*}  a
     * @param  {*}  b
     * @return {boolean}
     */
    function isEqual(a, b) {
        var t = typeof a;
        if (a ? !b : b) return false;
        if (t != typeof b) return false; 
        if (it(a, b)) return true;
        if (!a || !b || toString.call(a) !== toString.call(b)) return false; 
        if ('object' != t && 'function' != t) return false; 
        for (t in a) if (!isEqual(a[t], b[t])) return false;
        return isEqual(+a, +b);
    }
    xports['isEqual'] = is['eq'] = isEqual;

    return xports;
}));