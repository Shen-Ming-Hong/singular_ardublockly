/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          https://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileOverview Ardublockly JavaScript for the Blockly resources and bindings.
 */
'use strict';

goog.provide('Blockly.Blocks.singular');

goog.require('Blockly.Blocks');

goog.require('Blockly.Types');

Blockly.Blocks.singular.HUE = 120; //顏色為藍色

Blockly.Blocks['ultrasonic_distance'] = {
	init: function () {
		this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT).appendField(Blockly.Msg.ARD_ULTRASONIC_DISTANCE_SETUP);
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.ARD_ULTRASONIC_DISTANCE_TRIG)
			.appendField(new Blockly.FieldDropdown(Blockly.Arduino.Boards.selected.digitalPins), 'TRIG_PIN');
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.ARD_ULTRASONIC_DISTANCE_ECHO)
			.appendField(new Blockly.FieldDropdown(Blockly.Arduino.Boards.selected.digitalPins), 'ECHO_PIN');
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.ARD_ULTRASONIC_DISTANCE)
			.appendField(
				new Blockly.FieldDropdown([
					[Blockly.Msg.ARD_ULTRASONIC_DISTANCE_CM, 'cm'],
					[Blockly.Msg.ARD_ULTRASONIC_DISTANCE_INCH, 'inch'],
				]),
				'DISTANCE_UNIT'
			);
		this.appendValueInput('TIMEOUT')
			.setCheck('Number')
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.ARD_ULTRASONIC_DISTANCE_TIMEOUT);
		this.setOutput(true, 'Number');
		this.setColour(Blockly.Blocks.singular.HUE);
		this.setTooltip('');
		this.setHelpUrl('https://www.itead.cc/wiki/Ultrasonic_Ranging_Module_HC-SR04');
	},
	/** @return {!string} Type of the block, text length always an integer. */
	getBlockType: function () {
		return Blockly.Types.NUMBER;
	},
};

Blockly.Blocks['ultrasonic_distance_read'] = {
	init: function () {
		this.appendDummyInput().appendField(Blockly.Msg.ARD_PID_TRAIL_ULTRASONIC_DISTANCE_READ);
		this.setOutput(true, 'Number');
		this.setColour(Blockly.Blocks.singular.HUE);
		this.setTooltip('');
		this.setHelpUrl('');
	},
};

Blockly.Blocks['pid_trail'] = {
	init: function () {
		this.appendDummyInput().appendField(Blockly.Msg.ARD_PID_TRAIL);
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_PID_TRAIL_USE_FIVE_IR)
			.appendField(new Blockly.FieldCheckbox('TRUE'), 'USE_FIVE_IR');
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KP)
			.appendField(new Blockly.FieldNumber(100), 'KP')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KD)
			.appendField(new Blockly.FieldNumber(0), 'KD')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KI)
			.appendField(new Blockly.FieldNumber(0), 'KI')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_BASE_SPEED)
			.appendField(new Blockly.FieldNumber(100), 'BASE_SPEED')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_MS)
			.appendField(new Blockly.FieldNumber(0), 'MS');
		this.appendValueInput('EXIT_CONDITION').setCheck('Boolean').appendField(Blockly.Msg.ARD_PID_TRAIL_EXIT_CONDITION);
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_PID_TRAIL_ENABLE_ULTRASONIC)
			.appendField(new Blockly.FieldCheckbox('FALSE'), 'ENABLE_ULTRASONIC');
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.singular.HUE);
		this.setTooltip('');
		this.setHelpUrl('');
	},
};

Blockly.Blocks['pid_trail_left'] = {
	init: function () {
		this.appendDummyInput().appendField(Blockly.Msg.ARD_PID_TRAIL_LEFT);
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_PID_TRAIL_USE_FIVE_IR)
			.appendField(new Blockly.FieldCheckbox('TRUE'), 'USE_FIVE_IR');
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KP)
			.appendField(new Blockly.FieldNumber(100), 'KP')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KD)
			.appendField(new Blockly.FieldNumber(0), 'KD')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KI)
			.appendField(new Blockly.FieldNumber(0), 'KI')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_BASE_SPEED)
			.appendField(new Blockly.FieldNumber(100), 'BASE_SPEED')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_MS)
			.appendField(new Blockly.FieldNumber(0), 'MS');
		this.appendValueInput('EXIT_CONDITION').setCheck('Boolean').appendField(Blockly.Msg.ARD_PID_TRAIL_EXIT_CONDITION);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.singular.HUE);
		this.setTooltip('');
		this.setHelpUrl('');
	},
};

Blockly.Blocks['pid_left'] = {
	init: function () {
		this.appendDummyInput().appendField(Blockly.Msg.ARD_PID_LEFT);
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_PID_BASE_SPEED)
			.appendField(new Blockly.FieldNumber(100), 'BASE_SPEED')
			.appendField(Blockly.Msg.ARD_PID_TURN_SPEED_L)
			.appendField(new Blockly.FieldNumber(100), 'TURN_SPEED_L')
			.appendField(Blockly.Msg.ARD_PID_TURN_SPEED_R)
			.appendField(new Blockly.FieldNumber(100), 'TURN_SPEED_R')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KP)
			.appendField(new Blockly.FieldNumber(100), 'KP')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KD)
			.appendField(new Blockly.FieldNumber(0), 'KD')
			.appendField(Blockly.Msg.ARD_PID_USE_STOP)
			.appendField(new Blockly.FieldCheckbox('FALSE'), 'USE_STOP');
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.singular.HUE);
		this.setTooltip('');
		this.setHelpUrl('');
	},
};

Blockly.Blocks['pid_right'] = {
	init: function () {
		this.appendDummyInput().appendField(Blockly.Msg.ARD_PID_RIGHT);
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_PID_BASE_SPEED)
			.appendField(new Blockly.FieldNumber(100), 'BASE_SPEED')
			.appendField(Blockly.Msg.ARD_PID_TURN_SPEED_L)
			.appendField(new Blockly.FieldNumber(100), 'TURN_SPEED_L')
			.appendField(Blockly.Msg.ARD_PID_TURN_SPEED_R)
			.appendField(new Blockly.FieldNumber(100), 'TURN_SPEED_R')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KP)
			.appendField(new Blockly.FieldNumber(100), 'KP')
			.appendField(Blockly.Msg.ARD_PID_TRAIL_KD)
			.appendField(new Blockly.FieldNumber(0), 'KD')
			.appendField(Blockly.Msg.ARD_PID_USE_STOP)
			.appendField(new Blockly.FieldCheckbox('FALSE'), 'USE_STOP');
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.singular.HUE);
		this.setTooltip('');
		this.setHelpUrl('');
	},
};

Blockly.Blocks['set_motor_offset'] = {
	init: function () {
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_SET_MOTOR_OFFSET)
			.appendField(Blockly.Msg.ARD_SET_MOTOR_OFFSET_LEFT)
			.appendField(new Blockly.FieldNumber(0), 'LEFT_MOTOR_OFFSET')
			.appendField(Blockly.Msg.ARD_SET_MOTOR_OFFSET_RIGHT)
			.appendField(new Blockly.FieldNumber(0), 'RIGHT_MOTOR_OFFSET');
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_ULTRASONIC_DISTANCE_TRIG)
			.appendField(new Blockly.FieldDropdown(Blockly.Arduino.Boards.selected.digitalPins), 'ULTRASONIC_TRIG_PIN')
			.appendField(Blockly.Msg.ARD_ULTRASONIC_DISTANCE_ECHO)
			.appendField(new Blockly.FieldDropdown(Blockly.Arduino.Boards.selected.digitalPins), 'ULTRASONIC_ECHO_PIN');
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.singular.HUE);
		this.setTooltip('');
		this.setHelpUrl('');
	},
};

Blockly.Blocks['oled_display'] = {
	init: function () {
		this.appendDummyInput().appendField(Blockly.Msg.ARD_OLED_DISPLAY);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.singular.HUE);
		this.setTooltip('');
		this.setHelpUrl('');
	},
};
