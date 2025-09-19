 class Calculator {
            constructor(previousOperandElement, currentOperandElement) {
                this.previousOperandElement = previousOperandElement;
                this.currentOperandElement = currentOperandElement;
                this.clear();
            }

            clear() {
                this.currentOperand = '';
                this.previousOperand = '';
                this.operation = undefined;
                this.shouldResetDisplay = false;
            }

            delete() {
                if (this.shouldResetDisplay) {
                    this.clear();
                    return;
                }
                this.currentOperand = this.currentOperand.toString().slice(0, -1);
            }

            appendNumber(number) {
                if (this.shouldResetDisplay) {
                    this.currentOperand = '';
                    this.shouldResetDisplay = false;
                }
                
                if (number === '.' && this.currentOperand.includes('.')) return;
                this.currentOperand = this.currentOperand.toString() + number.toString();
            }

            chooseOperation(operation) {
                if (this.currentOperand === '') return;
                if (this.previousOperand !== '') {
                    this.compute();
                }
                this.operation = operation;
                this.previousOperand = this.currentOperand;
                this.currentOperand = '';
            }

            compute() {
                let computation;
                const prev = parseFloat(this.previousOperand);
                const current = parseFloat(this.currentOperand);
                
                if (isNaN(prev) || isNaN(current)) return;
                
                switch (this.operation) {
                    case '+':
                        computation = prev + current;
                        break;
                    case '-':
                        computation = prev - current;
                        break;
                    case '×':
                        computation = prev * current;
                        break;
                    case '÷':
                        if (current === 0) {
                            this.displayError('Cannot divide by zero');
                            return;
                        }
                        computation = prev / current;
                        break;
                    default:
                        return;
                }
                
                // Handle floating point precision
                computation = Math.round((computation + Number.EPSILON) * 100000000) / 100000000;
                
                this.currentOperand = computation;
                this.operation = undefined;
                this.previousOperand = '';
                this.shouldResetDisplay = true;
            }

            displayError(message) {
                this.currentOperand = message;
                this.currentOperandElement.classList.add('error');
                this.shouldResetDisplay = true;
                setTimeout(() => {
                    this.currentOperandElement.classList.remove('error');
                }, 2000);
            }

            getDisplayNumber(number) {
                const stringNumber = number.toString();
                const integerDigits = parseFloat(stringNumber.split('.')[0]);
                const decimalDigits = stringNumber.split('.')[1];
                let integerDisplay;
                
                if (isNaN(integerDigits)) {
                    integerDisplay = '';
                } else {
                    integerDisplay = integerDigits.toLocaleString('en', {
                        maximumFractionDigits: 0
                    });
                }
                
                if (decimalDigits != null) {
                    return `${integerDisplay}.${decimalDigits}`;
                } else {
                    return integerDisplay;
                }
            }

            updateDisplay() {
                if (typeof this.currentOperand === 'string' && this.currentOperand.includes('Cannot')) {
                    this.currentOperandElement.innerText = this.currentOperand;
                } else {
                    this.currentOperandElement.innerText = 
                        this.currentOperand === '' ? '0' : this.getDisplayNumber(this.currentOperand);
                }
                
                if (this.operation != null) {
                    this.previousOperandElement.innerText = 
                        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
                } else {
                    this.previousOperandElement.innerText = '';
                }
            }
        }

        const previousOperandElement = document.getElementById('previousOperand');
        const currentOperandElement = document.getElementById('currentOperand');

        const calculator = new Calculator(previousOperandElement, currentOperandElement);

        // Update display every time
        setInterval(() => {
            calculator.updateDisplay();
        }, 50);

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if (key >= '0' && key <= '9') {
                calculator.appendNumber(key);
            } else if (key === '.') {
                calculator.appendNumber(key);
            } else if (key === '+') {
                calculator.chooseOperation('+');
            } else if (key === '-') {
                calculator.chooseOperation('-');
            } else if (key === '*') {
                calculator.chooseOperation('×');
            } else if (key === '/') {
                event.preventDefault();
                calculator.chooseOperation('÷');
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                calculator.compute();
            } else if (key === 'Escape') {
                calculator.clear();
            } else if (key === 'Backspace') {
                calculator.delete();
            }
        });

        // Touch support for mobile
        let startY;
        document.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', function(e) {
            if (!startY) return;
            
            let endY = e.changedTouches[0].clientY;
            let diffY = startY - endY;
            
            if (Math.abs(diffY) > 50) {
                if (diffY > 0) {
                    // Swipe up - clear
                    calculator.clear();
                }
            }
            startY = null;
        });