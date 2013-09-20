/*!
 * curious      Typechecking module
 * @author      Ryan Van Etten <@ryanve>
 * @link        github.com/ryanve/curious
 * @license     MIT
 * @version     0.4.0
 */

(function(root, name, definition) {
    if (typeof module != 'undefined' && module['exports']) module['exports'] = definition(); 
    else root[name] = definition();
}(this, 'curious', function() {

    var xports = {}
      , globe = (function() { return this; }())
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
    
    function isWindow(o) {
        return null != o && o == o.window;
    }
    xports['isWindow'] = isWindow;
    xports['isGlobe'] = automateIs(globe);

    // Use the native isArray when available.
    var isArray = xports['isArray'] = is['Array'] = Array.isArray || automateIs('Array');

    // In modern browsers, `window` is not [object Object]. Normalize that.
    xports['isObject'] = is['Object'] = isWindow(globe) && is(globe, 'Object') ? function(item) {
        return !isWindow(item) && is(item, 'Object');
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

    //function isRealNumber(o) {// "number" and finite
    //    return o ? typeof o == 'number' && o > (o - 1) : 0 === o; 
    //}
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
     * @return {boolean}
     */
    function isStack(o) {
        return !!o && typeof o == 'object' && !o.nodeType && o.length === +o.length && o != o.window;
    }
  
    /**
     * @return {boolean}
     */
    function hasEnums(o) {
        for (var k in o) 
            if (owns.call(o, k)) return true;
        return false;
    }
  
    /**
     * @return {*}  o
     * @return {boolean}
     */
    xports['isEmpty'] = is['emp'] = function(o) {
        return '' === o || null == o || (isArray(o) ? 0 === o.length : !hasEnums(o));
    };
    
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