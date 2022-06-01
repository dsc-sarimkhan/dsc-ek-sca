const {colorText, color} = require('ns-logs');

class CustomError extends Error {
  constructor(taskName, error) {
    super();
    this.taskName = taskName;
    this.identation = '  ';
    this.message = error.message || error;
    this.details = error.details || error;
    this.showStack = false;
  }

  toString(){
    return this.createMessage();
  }

  createMessage(){
    const message = `Error Message\n${this.identation + this.message + this.createDetails()}`;
    return `${colorText(color.RED, 'Error')} in task ${colorText(color.CYAN, this.taskName)}\n${message}`;
  }

  createDetails() {
    if (typeof this.details !== 'object') {
      return '';
    }
    const errorDetailsArray = Object.keys(this.details).map((key)=>
      `${this.identation + key}: ${this.details[key]}\n`
    );
    return `\nError Details\n${errorDetailsArray.join('')}`;
  }
}

module.exports = CustomError;
