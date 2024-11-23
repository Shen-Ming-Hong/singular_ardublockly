/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          https://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileOverview Arduino code generator for the Servo library blocks.
 *     The Arduino Servo library docs: https://arduino.cc/en/reference/servo
 *
 * TODO: If angle selector added to blocks edit code here.
 */
'use strict';

goog.provide('Blockly.Arduino.Singular');

goog.require('Blockly.Arduino');

/**
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */
Blockly.Arduino['ultrasonic_distance'] = function (block) {
	var trigPin = block.getFieldValue('TRIG_PIN');
	var echoPin = block.getFieldValue('ECHO_PIN');
	var dUnit = block.getFieldValue('DISTANCE_UNIT');
	var timeout = Blockly.Arduino.valueToCode(block, 'TIMEOUT', Blockly.Arduino.ORDER_ATOMIC) || '30000'; // 獲取 TIMEOUT 欄位的值
	var comm = '';

	if (dUnit === 'cm') {
		comm = '(sonic_duration / 2.0) / 29.1';
	} else if (dUnit === 'inch') {
		comm = '(sonic_duration / 2.0) / 74.0';
	}
	var udName = 'ultrasonic_distance_' + dUnit;

	Blockly.Arduino.addSetup(udName + '_' + trigPin + '_setup_trig', 'pinMode(' + trigPin + ', OUTPUT);', true);
	Blockly.Arduino.addSetup(udName + '_' + echoPin + '_setup_echo', 'pinMode(' + echoPin + ', INPUT);', true);

	var fCode =
		'float ' +
		udName +
		'(int trigPin, int echoPin, unsigned long timeout){\n' +
		'  digitalWrite(trigPin, LOW);\n' +
		'  digitalWrite(echoPin, LOW);\n' +
		'  delayMicroseconds(5);\n' +
		'  digitalWrite(trigPin, HIGH);\n' +
		'  delayMicroseconds(10);\n' +
		'  digitalWrite(trigPin, LOW);\n' +
		'  unsigned long sonic_duration = pulseIn(echoPin, HIGH, timeout);\n' +
		'  float distance_' +
		dUnit +
		' = ' +
		comm +
		';\n\n' +
		'  return distance_' +
		dUnit +
		';\n' +
		'}';

	Blockly.Arduino.addFunction(udName + '_func', fCode);

	var code = udName + '(' + trigPin + ', ' + echoPin + ', ' + timeout + ')';
	return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['ultrasonic_distance_read'] = function (block) {
	var code = 'distance';
	return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['set_motor_offset'] = function (block) {
	var leftMotorOffset = block.getFieldValue('LEFT_MOTOR_OFFSET');
	var rightMotorOffset = block.getFieldValue('RIGHT_MOTOR_OFFSET');
	var ultrasonicTrigPin = block.getFieldValue('ULTRASONIC_TRIG_PIN');
	var ultrasonicEchoPin = block.getFieldValue('ULTRASONIC_ECHO_PIN');

	Blockly.Arduino.addInclude('oled', '#include <U8g2lib.h>');
	Blockly.Arduino.addVariable('leftMotorOffset', 'int leftMotorOffset = ' + leftMotorOffset + ';', true);
	Blockly.Arduino.addVariable('rightMotorOffset', 'int rightMotorOffset = ' + rightMotorOffset + ';', true);
	Blockly.Arduino.addVariable(
		'U8G2_SSD1306_128X64_NONAME_F_SW_I2C',
		'U8G2_SSD1306_128X64_NONAME_F_SW_I2C u8g2(U8G2_R0, /* clock=*/10, /* data=*/9, /* reset=*/U8X8_PIN_NONE);',
		true
	);
	Blockly.Arduino.addFunction(
		'global_variables',
		`
#define IR_OFFSET 450
volatile int IR_LL = 0;
volatile int IR_L = 0;
volatile int IR_M = 0;
volatile int IR_R = 0;
volatile int IR_RR = 0;
const int motorLeftPWM = 5;  // 左輪馬達 PWM 控制, 轉速0~255
const int motorRightPWM = 6; // 右輪馬達 PWM 控制, 轉速0~255
const int motorLeftDir = 4;  // 左輪馬達方向
const int motorRightDir = 7; // 右輪馬達方向
const int IR[5] = {A1, A2, A3, A4, A5};
`
	);

	Blockly.Arduino.addFunction(
		'IR_update',
		`
void IR_update() {
    // 讀取IR感測器，白色為0，黑色為1
    IR_LL = analogRead(IR[0]) > IR_OFFSET ? 1 : 0;
    IR_L = analogRead(IR[1]) > IR_OFFSET ? 1 : 0;
    IR_M = analogRead(IR[2]) > IR_OFFSET ? 1 : 0;
    IR_R = analogRead(IR[3]) > IR_OFFSET ? 1 : 0;
    IR_RR = analogRead(IR[4]) > IR_OFFSET ? 1 : 0;
}
`
	);

	Blockly.Arduino.addFunction(
		'motor',
		`
// 控制左右輪的馬達
void motor(int speedL, int speedR) {
    digitalWrite(motorLeftDir, speedL < 0 ? LOW : HIGH);
    digitalWrite(motorRightDir, speedR < 0 ? LOW : HIGH);
    analogWrite(motorLeftPWM, constrain(abs(speedL) + leftMotorOffset, 0, 255));
    analogWrite(motorRightPWM, constrain(abs(speedR) + rightMotorOffset, 0, 255));
}
`
	);

	Blockly.Arduino.addFunction(
		'stop',
		`
void stop() {
    motor(-255, -255);
    delay(10);
    motor(0, 0);
}
`
	);

	Blockly.Arduino.addFunction(
		'PID_trail',
		`
// PID循跡
void PID_trail(bool useFiveIR, bool (*exitCondition)(), float Kp, float Kd, float Ki, int baseSpeed, unsigned long ms, bool useUltraSonic) {
    const int minimumSpeed = -255; // 最小速度
    const int maximumSpeed = 255;  // 最大速度
    int lastError = 0;             // 上一次的偏差值
    int integral = 0;              // 積分項

    unsigned long start_time = millis();

    while (true)
    {
        if (ms > 0 && millis() - start_time >= ms)
        {
            break;
        }

        IR_update();

        if (useUltraSonic)
        {
            ultrasonic();
        }
        // 計算偏差值
        int error = 0;

        if (useFiveIR)
        {
            if (IR_LL == 0 && IR_L == 0 && IR_M == 1 && IR_R == 0 && IR_RR == 0)
            {
                error = 0;
            }
            else if (IR_LL == 0 && IR_L == 1 && IR_M == 1 && IR_R == 0 && IR_RR == 0)
            {
                error = -0.4;
            }
            else if (IR_LL == 0 && IR_L == 0 && IR_M == 1 && IR_R == 1 && IR_RR == 0)
            {
                error = 0.4;
            }
            else if (IR_LL == 0 && IR_L == 1 && IR_M == 0 && IR_R == 0 && IR_RR == 0)
            {
                error = -1.9;
            }
            else if (IR_LL == 0 && IR_L == 0 && IR_M == 0 && IR_R == 1 && IR_RR == 0)
            {
                error = 1.9;
            }
            else if (IR_LL == 1 && IR_L == 1 && IR_M == 0 && IR_R == 0 && IR_RR == 0)
            {
                error = -2.8;
            }
            else if (IR_LL == 0 && IR_L == 0 && IR_M == 0 && IR_R == 1 && IR_RR == 1)
            {
                error = 2.8;
            }
            else if (IR_LL == 1 && IR_L == 0 && IR_M == 0 && IR_R == 0 && IR_RR == 0)
            {
                error = -4.4;
            }
            else if (IR_LL == 0 && IR_L == 0 && IR_M == 0 && IR_R == 0 && IR_RR == 1)
            {
                error = 4.4;
            }
            else
            {
                error = lastError;
            }
        }
        else
        {
            if (IR_L == 0 && IR_M == 1 && IR_R == 0)
            {
                error = 0;
            }
            else if (IR_L == 1 && IR_M == 1 && IR_R == 0)
            {
                error = -0.4;
            }
            else if (IR_L == 0 && IR_M == 1 && IR_R == 1)
            {
                error = 0.4;
            }
            else if (IR_L == 1 && IR_M == 0 && IR_R == 0)
            {
                error = -1.9;
            }
            else if (IR_L == 0 && IR_M == 0 && IR_R == 1)
            {
                error = 1.9;
            }
            else
            {
                error = lastError;
            }
        }

        // 計算積分項
        integral += error;

        // 計算微分項
        int derivative = error - lastError;

        // 計算調整值
        int adjustment = Kp * error + Ki * integral + Kd * derivative;

        // 計算新的馬達速度
        int speedL = baseSpeed + adjustment;
        int speedR = baseSpeed - adjustment;

        // 限制速度在最小和最大速度之間
        speedL = constrain(speedL, minimumSpeed, maximumSpeed);
        speedR = constrain(speedR, minimumSpeed, maximumSpeed);

        // 設置馬達速度
        motor(speedL, speedR);

        // 更新上一次的偏差值
        lastError = error;

        if (ms == 0 && exitCondition())
        {
            break;
        }
    }
}
`
	);

	Blockly.Arduino.addFunction(
		'PID_trail_left',
		`
void PID_trail_left(bool useFiveIR, bool (*exitCondition)(), float Kp, float Kd, float Ki, int baseSpeed, unsigned long ms)
{
    const int minimumSpeed = -255; // 最小速度
    const int maximumSpeed = 255;  // 最大速度
    int lastError = 0;             // 上一次的偏差值
    int integral = 0;              // 積分項

    unsigned long start_time = millis();

    while (true)
    {
        if (ms > 0 && millis() - start_time >= ms)
        {
            break;
        }

        IR_update();
        // 計算偏差值
        int error = 0;

        if (useFiveIR)
        {
            if (IR_LL == 0 && IR_L == 0 && IR_M == 1 && IR_R == 0 && IR_RR == 0)
            {
                error = -0.4;
            }
            else if (IR_LL == 0 && IR_L == 1 && IR_M == 1 && IR_R == 0 && IR_RR == 0)
            {
                error = -0.4;
            }
            else if (IR_LL == 0 && IR_L == 1 && IR_M == 0 && IR_R == 0 && IR_RR == 0)
            {
                error = -1.9;
            }
            else if (IR_LL == 1 && IR_L == 1 && IR_M == 0 && IR_R == 0 && IR_RR == 0)
            {
                error = -2.8;
            }
            else if (IR_LL == 1 && IR_L == 0 && IR_M == 0 && IR_R == 0 && IR_RR == 0)
            {
                error = -4.4;
            }
            else
            {
                error = lastError;
            }
        }
        else
        {
            if (IR_L == 0 && IR_M == 1 && IR_R == 0)
            {
                error = -0.4;
            }
            else if (IR_L == 1 && IR_M == 1 && IR_R == 0)
            {
                error = -0.4;
            }
            else if (IR_L == 1 && IR_M == 0 && IR_R == 0)
            {
                error = -1.9;
            }
            else
            {
                error = lastError;
            }
        }

        // 計算積分項
        integral += error;

        // 計算微分項
        int derivative = error - lastError;

        // 計算調整值
        int adjustment = Kp * error + Ki * integral + Kd * derivative;

        // 計算新的馬達速度
        int speedL = baseSpeed + adjustment;
        int speedR = baseSpeed - adjustment;

        // 限制速度在最小和最大速度之間
        speedL = constrain(speedL, minimumSpeed, maximumSpeed);
        speedR = constrain(speedR, minimumSpeed, maximumSpeed);

        // 設置馬達速度
        motor(speedL, speedR);

        // 更新上一次的偏差值
        lastError = error;

        if (ms == 0 && exitCondition())
        {
            break;
        }
    }
}
`
	);
	Blockly.Arduino.addFunction(
		'PID_right',
		`
void PID_right(int baseSpeed, int turnSpeedL, int turnSpeedR, float Kp, float Kd, bool useStop)
{
    PID_trail(false, []()
              { return (IR_RR == 1); }, Kp, Kd, 0, baseSpeed, 0, false);
    while (!(IR_RR == 0))
    {
        motor(baseSpeed, baseSpeed);
        IR_update();
    }
    if (useStop)
    {
        stop();
    }
    while (!(IR_RR))
    {
        IR_update();
        motor(turnSpeedL, turnSpeedR);
    }
    while (!(IR_RR == 0))
    {
        IR_update();
        motor(turnSpeedL, turnSpeedR);
    }
}
`
	);
	Blockly.Arduino.addFunction(
		'PID_left',
		`
void PID_left(int baseSpeed, int turnSpeedL, int turnSpeedR, float Kp, float Kd, bool useStop)
{
    PID_trail(false, []()
              { return (IR_LL == 1); }, Kp, Kd, 0, baseSpeed, 0, false);
    while (!(IR_LL == 0))
    {
        motor(baseSpeed, baseSpeed);
        IR_update();
    }
    if (useStop)
    {
        stop();
    }
    while (!(IR_LL))
    {
        IR_update();
        motor(turnSpeedL, turnSpeedR);
    }
    while (!(IR_LL == 0))
    {
        IR_update();
        motor(turnSpeedL, turnSpeedR);
    }
}
`
	);

	// 移除超音波相關的設定程式碼
	Blockly.Arduino.addFunction(
		'ultrasonic',
		`
const int trigPin = ${ultrasonicTrigPin};  // Trig腳位
const int echoPin = ${ultrasonicEchoPin};  // Echo腳位
float distance = 0;
volatile unsigned long echoStart = 0;
volatile unsigned long echoEnd = 0;
volatile bool measuring = false;

void ultrasonic() {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
}

void echoISR() {
    if (digitalRead(echoPin) == HIGH) {
        echoStart = micros();
    } else {
        echoEnd = micros();
        unsigned long duration = echoEnd - echoStart;
        distance = (duration / 2.0) / 29.1;
    }
}
`,
		true
	);

	Blockly.Arduino.addFunction(
		'OLED',
		`
void OLED_init()
{
    u8g2.begin();
    u8g2.setContrast(255); // 增加此行以設定最大亮度
    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_ncenB08_tr);
    u8g2.drawStr(0, 10, "OLED Init OK!"); // 增加初始化確認訊息
    u8g2.sendBuffer();
    delay(1000);
}

void OLED_display()
{
    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_helvB08_tr);

    char buffer[32];

    // 讀取A0並計算電壓
    double sum = 0;
    double voltage = 0;
    int loop = 20;
    for (int i = 0; i < loop; i++)
    {
        int sensorValue = analogRead(A0);
        voltage = sensorValue * (5.0 / 1023.0) * 5.0 * 0.994;
        sum += voltage;
    }
    voltage = sum / loop;
    // Serial.println(voltage);

    int intPart = (int)voltage;                         // 整數部分
    int decimalPart = (int)((voltage - intPart) * 100); // 小數部分（保留兩位小數）

    sprintf(buffer, "Volt:%d.%02dV", intPart, abs(decimalPart));
    u8g2.drawStr(0, 10, buffer);

    sprintf(buffer, "IR_LL:%4d", analogRead(IR[0]));
    u8g2.drawStr(0, 20, buffer);

    sprintf(buffer, "IR_L:%4d", analogRead(IR[1]));
    u8g2.drawStr(0, 30, buffer);

    sprintf(buffer, "IR_M:%4d", analogRead(IR[2]));
    u8g2.drawStr(0, 40, buffer);

    sprintf(buffer, "IR_R:%4d", analogRead(IR[3]));
    u8g2.drawStr(0, 50, buffer);

    sprintf(buffer, "IR_RR:%4d", analogRead(IR[4]));
    u8g2.drawStr(0, 60, buffer);

    u8g2.sendBuffer();
    delay(100);
}
    `,
		true
	);

	Blockly.Arduino.addSetup(
		'ultrasonic_setup',
		`
for (int i = 0; i < 5; i++) {
    pinMode(IR[i], INPUT); // 數值為0~1023，白色為0，黑色為1023
}

pinMode(motorLeftPWM, OUTPUT);
pinMode(motorRightPWM, OUTPUT);
pinMode(motorLeftDir, OUTPUT);
pinMode(motorRightDir, OUTPUT);
pinMode(trigPin, OUTPUT);
pinMode(echoPin, INPUT);
pinMode(A0, INPUT);
attachInterrupt(digitalPinToInterrupt(echoPin), echoISR, CHANGE);
OLED_init(); // OLED 初始化
        `,
		true
	);

	return '';
};

Blockly.Arduino['pid_trail'] = function (block) {
	var useFiveIR = block.getFieldValue('USE_FIVE_IR') === 'TRUE';
	var kp = block.getFieldValue('KP');
	var kd = block.getFieldValue('KD');
	var ki = block.getFieldValue('KI');
	var baseSpeed = block.getFieldValue('BASE_SPEED');
	var ms = block.getFieldValue('MS');
	var exitCondition = Blockly.Arduino.valueToCode(block, 'EXIT_CONDITION', Blockly.Arduino.ORDER_ATOMIC);
	var enableUltrasonic = block.getFieldValue('ENABLE_ULTRASONIC') === 'TRUE';

	var code = `PID_trail(${useFiveIR}, [](){return ${exitCondition};}, ${kp}, ${kd}, ${ki}, ${baseSpeed}, ${ms}, ${enableUltrasonic});\n`;
	return code;
};

Blockly.Arduino['pid_trail_left'] = function (block) {
	var useFiveIR = block.getFieldValue('USE_FIVE_IR') === 'TRUE';
	var kp = block.getFieldValue('KP');
	var kd = block.getFieldValue('KD');
	var ki = block.getFieldValue('KI');
	var baseSpeed = block.getFieldValue('BASE_SPEED');
	var ms = block.getFieldValue('MS');
	var exitCondition = Blockly.Arduino.valueToCode(block, 'EXIT_CONDITION', Blockly.Arduino.ORDER_ATOMIC);

	var code = `PID_trail_left(${useFiveIR}, [](){return ${exitCondition};}, ${kp}, ${kd}, ${ki}, ${baseSpeed}, ${ms});\n`;
	return code;
};

Blockly.Arduino['pid_left'] = function (block) {
	var baseSpeed = block.getFieldValue('BASE_SPEED');
	var turnSpeedL = block.getFieldValue('TURN_SPEED_L');
	var turnSpeedR = block.getFieldValue('TURN_SPEED_R');
	var kp = block.getFieldValue('KP');
	var kd = block.getFieldValue('KD');
	var useStop = block.getFieldValue('USE_STOP') === 'TRUE';

	var code = `PID_left(${baseSpeed}, ${turnSpeedL}, ${turnSpeedR}, ${kp}, ${kd}, ${useStop});\n`;
	return code;
};

Blockly.Arduino['pid_right'] = function (block) {
	var baseSpeed = block.getFieldValue('BASE_SPEED');
	var turnSpeedL = block.getFieldValue('TURN_SPEED_L');
	var turnSpeedR = block.getFieldValue('TURN_SPEED_R');
	var kp = block.getFieldValue('KP');
	var kd = block.getFieldValue('KD');
	var useStop = block.getFieldValue('USE_STOP') === 'TRUE';

	var code = `PID_right(${baseSpeed}, ${turnSpeedL}, ${turnSpeedR}, ${kp}, ${kd}, ${useStop});\n`;
	return code;
};

Blockly.Arduino['oled_display'] = function (block) {
	return 'OLED_display();\n';
};
