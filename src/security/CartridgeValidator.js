/**
 * Validates and monitors cartridge execution
 */
export class CartridgeValidator {
  /**
   * Validates a cartridge's structure and safety
   * @param {Object} cartridge - The cartridge to validate
   * @returns {boolean} True if cartridge is valid
   * @throws {Error} If cartridge is invalid or potentially harmful
   */
  static validateCartridge(cartridge) {
    if (!cartridge || typeof cartridge !== 'object') {
      throw new Error('Invalid cartridge format');
    }

    if (!this._validateStructure(cartridge)) {
      throw new Error('Invalid cartridge structure');
    }

    if (!this._validateSafety(cartridge)) {
      throw new Error('Cartridge contains potentially harmful code');
    }

    return true;
  }

  static _validateStructure(cartridge) {
    // Validate that the cartridge has the required methods
    const requiredMethods = ['drawCartridge'];
    return requiredMethods.every(method => typeof cartridge[method] === 'function');
  }

  static _validateSafety(cartridge) {
    const cartridgeString = cartridge.toString();
    const dangerousPatterns = [
      // Detect usage of potentially dangerous patterns
      'eval\\(',
      'Function\\(',
      '(?:set|clear)(?:Timeout|Interval)\\(',
      'document\\.',
      'window\\.',
      '(?:local|session)Storage',
      'indexedDB',
      '__(?:proto|defineGetter|defineSetter|lookupGetter|lookupSetter)__'
    ];

    return !new RegExp(dangerousPatterns.join('|'), 'i').test(cartridgeString);
  }

  /**
   * Creates a proxy to monitor cartridge runtime performance
   * @param {Object} cartridge - The cartridge to monitor
   * @param {number} executionLimit - Maximum execution time in milliseconds
   * @returns {Proxy} Monitored cartridge
   * @throws {Error} If execution time limit is exceeded
   */
  static monitorRuntime(cartridge, executionLimit = 1000) {
    let lastExecutionTime = 0;
    const executionTimes = [];
    
    return new Proxy(cartridge, {
      apply(target, thisArg, args) {
        const start = performance.now();
        
        // Detect excessive CPU usage patterns
        if (executionTimes.length >= 10) {
          const avgExecutionTime = executionTimes.reduce((a, b) => a + b) / executionTimes.length;
          if (avgExecutionTime > executionLimit * 0.8) {
            throw new Error('Cartridge showing consistent high CPU usage');
          }
          executionTimes.shift();
        }
        
        const result = Reflect.apply(target, thisArg, args);
        const executionTime = performance.now() - start;
        executionTimes.push(executionTime);
        
        if (executionTime > executionLimit) {
          throw new Error(`Cartridge execution time exceeded limit (${Math.round(executionTime)}ms > ${executionLimit}ms)`);
        }
        
        return result;
      }
    });
  }
}
