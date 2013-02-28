/*!
 * diesel       Typechecking module
 * @author      Ryan Van Etten <@ryanve>
 * @link        github.com/ryanve/diesel
 * @license     MIT
 * @version     0.2.1
 */

(function(root, name, definition) {
    if (typeof module != 'undefined' && module['exports'])
        module['exports'] = definition(); 
    else root[name] = definition();
}(this, 'diesel', function() {

    var d = {} // diesel
      , root = this
      , win = window
      , types = /function|object|string|number|boolean|undefined/
      , owns = d.hasOwnProperty
      , toString = d.toString;

    /**
     * @param   {*}      item    item to test
     * @param   {string} type    case-sensitive type to test for
     * @return  {boolean}
     *
     * @example is(item, 'object')  # true for typeof "object"
     * @example is(item, 'Object')  # true for [object Object]
     * @example is(item, 'null')    # true if item === null
     */
    function is(item, type) {
        if (typeof item === type) return true; // object|function|undefined|number|boolean|string
        if (null == item || item !== item) return ('' + item) === type; // null|undefined|NaN
        return ('[object ' + type + ']') === toString.call(item); // Object|Array|RegExp|Date|...
    }
    d['is'] = is;

    /**
     * @param  {(string|*)=} type  is a type to test for via is()
     *                             OR a value to compare directly
     * @param  {boolean=}    inv   use true to invert the test
     * @return {Function}
     */
    function automateIs(type, inv) {
        inv = true === inv;
        if (typeof type == 'string' && type) {
            return (types.test(type)
                ? function(o) { return inv != (typeof o === type); }
                : function(o) { return inv != is(o, type); }
            );
        }
        return ((type === type) == inv
            ? function(o) { return (o !== o) == inv; }
            : function(o) { return (o === o) == inv; }
        );
    }
    is['automate'] = automateIs;

    // Use the native isArray when available.
    var isArray = d['isArray'] = is['Array'] = Array.isArray || automateIs('Array');

    // is(item, 'Object') tests exactly for [object Object]
    // In modern browsers, that excludes the window. Ensure:
    var isObject = d['isObject'] = is['Object'] = is(win, 'Object') ? function(item) {
        return item !== win && is(item, 'Object');
    } : automateIs('Object');
    
    var isArguments = d['isArguments'] = is['Arguments'] = !is(arguments, 'Arguments') ? function(item) {
        return !!(item && owns.call(item, 'callee'));
    } : automateIs('Arguments');
    
    // ~ github.com/ded/valentine
    is['boo'] = automateIs('boolean');
    is['obj'] = automateIs('object');
    is['num'] = automateIs('number');
    is['str'] = automateIs('string');
    is['fun'] = d['isFunction'] = automateIs('function');
    //is['und'] = d['isUndefined'] = automateIs();
    is['und'] = automateIs();
    is['def'] = automateIs(void 0, true);
    
    // + oper coerces funcs and plain objs to NaN 
    d['isNaN'] = is['nan'] = automateIs(+{});
    
    // ~ underscorejs.org
    // debating on whether or not to expose all of these
    d['isRegExp'] = is['RegExp'] = is['reg'] = automateIs('RegExp');
    //d['isNull'] = automateIs(null);
    //d['isBoolean'] = automateIs('Boolean');
    //d['isString'] = automateIs('String');
    //d['isDate'] = automateIs('Date');
    //d['isFunction'] = automateIs('Function');

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
    d['isNode'] = is['node'] = isNode;
    
    function automateNode(n) {
        if (!(n > 0)) { throw new TypeError; }
        return function(o) {
            return !!o && n === o.nodeType;
        };
    }
    isNode['automate'] = automateNode;
    d['isElement'] = is['elem'] = automateNode(1);
    
    /**
     * @param  {*} o
     * @param  {*} k
     * @return {boolean}
     */
    function has(o, k) {
        return owns.call(o, k);
    }
    //d['has'] = has;
    
    /**
     * @return  {number|boolean}
     */
    function count(o) {
        if (typeof o != 'object' || !o || o.nodeType || o === win)
            return false
        return typeof (o = o.length) == 'number' && o === o ? o : false
    }
    
    function isIndexed(o) {
        if (typeof o == 'object' ? !o || o.nodeType || o === win : typeof o != 'string')
            return false;
        return typeof (o = o.length) == 'number' && o === o;
    }
    //d['isIndexed'] = isIndexed;
  
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
        if (0 === o.length)
            return o !== win;
         // vs: 
         // if (isArray(o) || isArguments(o))
         //   return !o.length;
        for (var k in o)
            if (owns.call(o, k))
              return false;
        return true;
    }
    d['isEmpty'] = is['emp'] = isEmpty;
    
    /**
     * @param  {*}  a
     * @param  {*}  b
     * @return {boolean}
     */
    function isEqual(a, b) {
        var t = typeof a;
        if (t != typeof b || (a ? !b : b))
            return false; 
        if (a === b ? a === a : a !== a && b !== b)
            return true; 
        if (!a || !b || toString.call(a) !== toString.call(b))
            return false; 
        if ('object' != t && 'function' != t)
            return false; 
        for (t in a)
            if (!isEqual(a[t], b[t]))
                return false;
        return isEqual(+a, +b);
    }
    d['isEqual'] = is['eq'] = isEqual;

    return d;

}));