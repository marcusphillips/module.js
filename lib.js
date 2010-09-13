/*!
 * LIB JavaScript Library
 * Version 1.0
 * http://github.com/marcusphillips/LIB
 *
 * Copyright 2010, Marcus Phillips
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

var LIB = function(libraryName){
  var defaultConfig, dependencies;
  if(arguments.length === 4){
    defaultConfig = arguments[1];
    dependencies = arguments[2];
  }else if(arguments.length === 3){
    typeof arguments[1] === 'array' ? dependencies = arguments[1] : defaultConfig = arguments[1];
  }
  var init = arguments[arguments.length-1];

  var config = {};
  for(var key in defaultConfig){
    config[key] = defaultConfig[key];
  }
  // if LIB.configure(libraryName) was called prior to library inclusion, those properties will mask the ones provided in the defaultConfigs object
  for(key in LIB._configs[libraryName]){
    config[key] = LIB._configs[libraryName][key];
  }

  if(typeof config.attachTo === 'undefined'){
    // if nothing is specified, the library is placed in the global scope
    config.attachTo = (function(){return this;}());
  }else if(typeof config.attachTo === 'string'){
    // config.attachTo can be a string representing a path from the global scope
    // todo: allow periods in scope string
    var scopeKeys = config.attachTo.split('.');
    config.attachTo = (function(){return this;}());
    for(var whichKey = 0; whichKey < scopeKeys.length; whichKey++){
      config.attachTo = config.attachTo[scopeKeys[whichKey]];
    }
  }

  // library key defaults to the library name
  config.key = config.key || libraryName;

  // todo allow dependencies, and provide thos libraries as the first args to the init function
  var args = [];
  args.push(config);
  // todo: provide feedback if overwriting
  config.attachTo[config.key] = init.apply({}, args);
  LIB._hasInitialized[libraryName] = true;
};

LIB.configure = function(libraryName, configuration){
  if(LIB._hasInitialized[libraryName] && typeof console !== 'undefined'){
    if(typeof console !== undefined && typeof console.warn === 'function'){
      console.warn('You are trying to LIB.configure() the library '+libraryName+', which has already been initialized once');
    }
  }
  LIB._configs[libraryName] = LIB._configs[libraryName] || {};
  for(var key in configuration){
    LIB._configs[libraryName][key] = configuration[key]
  }
};

LIB._configs = {};

LIB._hasInitialized = {};

var _VARS = function(readAccess, writeAccess, keyAccess, values){
  if(typeof readAccess === 'object'){
    values = readAccess;
    delete readAccess;
  }else if(typeof writeAccess === 'object'){
    values = writeAccess;
    delete writeAccess;
  }else if(typeof keyAccess === 'object'){
    values = keyAccess;
    delete keyAccess;
  }
  values = values || {};

  // the result is a callable object
  // when called, it augments the input with an acces method that provides controllable access to the private variable scope
  var result = function(key, object){
    var _keyAccess = true;
    var _readAccess = true;
    var _writeAccess = true;
    // todo: make optional access restrictions
    /*
    var kwargs = SIG(
      '<0-1 boolean> readAccess =',false,
      '<0-1 boolean> writeAccess=',false,
      '<0-1 string>  key=','_',
      '<object>      object'
    );
    */

    if(!object){
      object = key;
      key = undefined;
    }
    object[key || '_'] = function(identifier, value){
      if(arguments.length === 0){
        if(!_keyAccess){ throw new Error('Permission denied to get keys from a _VARS object'); }
        // provide a list of valid keys
        var keys = [];
        for(var which in result){
          keys.push(which);
        }
        return keys;
      }else if(arguments.length === 1){
        if(!_readAccess){ throw new Error('Permission denied to read from a _VARS() object'); }
        return result[identifier];
      }else if(arguments.length === 2){
        if(!_writeAccess){ throw new Error('Permission denied to write to a _VARS object'); }
        result[identifier] = value;
      }
    };

    return object;
  };

  for(var which in values){
    result[which] = values[which];
  }
  values = undefined;

  return result;

  if(_.readPrivates){ return _[identifier]; }
  throw new Error('This object does not allow read access to private variables');
};
