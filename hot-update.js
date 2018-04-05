webpackHotUpdate(0,{

/***/ "./components/scope.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _qlik = __webpack_require__("qlik");

var _qlik2 = _interopRequireDefault(_qlik);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function ($scope) {
	// Initialization code
	$scope.state = {
		triggers: [],
		selectionHashes: {},
		programmicChangeFlag: false
	};

	// console.log('selection state check', $scope.state.selectionState);

	// Functions

	$scope.createSelectionObj = function (selections) {
		return selections.map(function (selection) {
			return {
				field: selection.fieldName,
				selected: selection.qSelected
			};
		});
	};

	//////////////////////////////////////////////
	// Create helper function for array equality /
	//////////////////////////////////////////////
	$scope.arraysEqual = function (x, y) {
		'use strict';

		if (x === null || x === undefined || y === null || y === undefined) {
			return x === y;
		}
		// after this just checking type of one would be enough
		if (x.constructor !== y.constructor) {
			return false;
		}
		// if they are functions, they should exactly refer to same one (because of closures)
		if (x instanceof Function) {
			return x === y;
		}
		// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
		if (x instanceof RegExp) {
			return x === y;
		}
		if (x === y || x.valueOf() === y.valueOf()) {
			return true;
		}
		if (Array.isArray(x) && x.length !== y.length) {
			return false;
		}

		// if they are dates, they must had equal valueOf
		if (x instanceof Date) {
			return false;
		}

		// if they are strictly equal, they both need to be object at least
		if (!(x instanceof Object)) {
			return false;
		}
		if (!(y instanceof Object)) {
			return false;
		}

		// recursive object equality check
		var p = Object.keys(x);
		return Object.keys(y).every(function (i) {
			return p.indexOf(i) !== -1;
		}) && p.every(function (i) {
			return $scope.arraysEqual(x[i], y[i]);
		});
	};

	$scope.createHash = function (val) {
		var hash = 0;
		if (val.length == 0) {
			return hash;
		}
		for (var i = 0; i < val.length; i++) {
			var char = val.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	};

	$scope.createFieldTriggerMap = function (fieldTriggers) {

		// clear trigger array in case triggers were removed
		$scope.state.triggers = [];

		// loop through each field trigger and create a clean record
		fieldTriggers.map(function (trigger) {
			$scope.state.triggers.push({
				field: trigger.qListObject.qDimensionInfo.qGroupFieldDefs[0],
				actionType: trigger.fieldTrigger.actionType,
				eventType: trigger.fieldTrigger.eventType,
				targetField: trigger.fieldTrigger.targetField,
				targetFieldSearchString: trigger.fieldTrigger.targetFieldSearchString,
				triggerFired: false
			});
		});
		// console.log('final hashes', $scope.state.triggers);
	};

	$scope.diffArrays = function (hashArray, diffArray) {
		// hash newest selections
		// console.log('hashArray', hashArray, 'diffArray', diffArray);
		$scope.state.selectionHashes = {};
		hashArray.map(function (currSelection) {
			$scope.state.selectionHashes[currSelection.field + '|' + currSelection.selected] = currSelection;
		});

		diffArray.filter(function (prevSelection) {
			return !$scope.state.selectionHashes[prevSelection.field + '|' + prevSelection.selected];
		});

		// console.log('not found selections', diffArray);
		return diffArray;
		// diffArray.map((prevSelection) => {
		// 	console.log('prev sel hashes', $scope.state.selectionHashes[($scope.createHash(prevSelection.field + '|' + prevSelection.selected))], prevSelection);
		// 	if (!$scope.state.selectionHashes[($scope.createHash(prevSelection.field + '|' + prevSelection.selected))]) {

		// 		return prevSelection;
		// 	}
		// });

		// console.log('hash table', $scope.state.selectionHashes);
	};

	$scope.runTrigger = function (trigger, context) {
		console.log('trigger called', trigger, context);

		$scope.state.selectionState.selections.map(function (sel) {
			console.log('selections', sel);
		});

		switch (trigger.actionType) {
			case 'selectField':
				console.log('selection');
				$scope.state.programmicChangeFlag = true;
				_qlik2.default.currApp().field(trigger.targetField).selectValues([{ qText: trigger.targetFieldSearchString }], true, true);
				break;
			case 'selectExcluded':
				$scope.state.programmicChangeFlag = true;
				_qlik2.default.currApp().field(trigger.targetField).selectExcluded();
				break;
			case 'selectPossible':
				console.log('selection pos');
				$scope.state.programmicChangeFlag = true;
				_qlik2.default.currApp().field(trigger.targetField).selectExcluded();
				break;
			case 'clearField':
				$scope.state.programmicChangeFlag = true;
				_qlik2.default.currApp().field(trigger.targetField).clear();
				break;
			case 'lockField':
				$scope.state.programmicChangeFlag = true;
				_qlik2.default.currApp().field(trigger.targetField).lock();
				break;
			case 'unlockField':
				$scope.state.programmicChangeFlag = true;
				_qlik2.default.currApp().field(trigger.targetField).unlock();
				break;
			default:
				console.log('nobody home on these triggers');
				break;
		}
	};
	// $scope.component.model.Invalidated.bind( function () {
	// 	console.info( 'Invalidated' );
	// 	$scope.state.prevSelectionState = $scope.state.selectionState;
	// } );
	$scope.selectionListener = function () {
		console.log('change type', $scope.state.programmicChangeFlag);
		if ($scope.state.programmicChangeFlag) {
			$scope.state.programmicChangeFlag = false;
			return;
		}
		console.log('prog flag after field selection', $scope.state.programmicChangeFlag);

		var newSelections = $scope.createSelectionObj($scope.state.selectionState.selections);
		console.log('event', $scope.state.selectionState, 'newObj', newSelections, 'prevObj', $scope.state.selectionObj);
		console.log('scope', $scope);

		// check if new selections and old selections are the same
		var selectionChangeFlag = $scope.arraysEqual($scope.state.selectionObj, newSelections);
		// console.log('status', selectionChangeFlag);


		// check if selections have changed since last time process was checked
		if (selectionChangeFlag === false) {

			$scope.createFieldTriggerMap($scope.$parent.layout.fieldTrigger);
			console.log($scope.$parent.layout.fieldTrigger);

			// diff selections to catch newest selection/clea
			// check counts, if new > old then new selection, if old < new then cleared
			// if counts equal, loop through new and inner loop through old checking values
			if ($scope.state.selectionObj.length > newSelections.length) {
				// selection cleared
				var clearedSelection = $scope.diffArrays(newSelections, $scope.state.selectionObj);
				console.log('selection cleared', clearedSelection);
			} else if ($scope.state.selectionObj.length < newSelections.length) {
				// selection made
				var madeSelection = $scope.diffArrays($scope.state.selectionObj, newSelections);

				var targetedTrigger = $scope.state.triggers.filter(function (trigger) {
					return trigger.field === madeSelection[0].field;
				});

				console.log('selection made', madeSelection, 'target', targetedTrigger);

				targetedTrigger.map(function (indivTrigger) {
					$scope.runTrigger(indivTrigger, madeSelection[0].field);
				});
			} else if ($scope.arraysEqual($scope.state.selectionObj, newSelections)) {
				console.log('what are you doing here! these arrays are the same');
			} else {
				// check which values were cleared or made
				var fieldChange = $scope.diffArrays(newSelections, $scope.state.selectionObj);
				console.log('changes in field', fieldChange);
			}
		}

		$scope.state.selectionObj = newSelections;

		// run below for new selection

		// check if selection in triggers

		// if in triggers and unfired, fire and flip flag

		// if in triggers and fired, do nothing

		// if not in triggers - do nothing

		//unregister the listener when no longer notification is needed.
		// $scope.state.selectionState.OnData.unbind( $scope.selectionListener );
	};

	// set initial scope state for selections
	if (!$scope.state.selectionState) {

		$scope.state.selectionState = _qlik2.default.currApp().selectionState();
		$scope.state.selectionState.OnData.bind($scope.selectionListener);

		$scope.state.selectionObj = $scope.createSelectionObj($scope.state.selectionState.selections);

		console.log('inital selection state', $scope.state.selectionState);
	}

	$scope.component.model.Validated.bind(function () {
		// var newSelectionState = qlik.currApp().selectionState( ).selections;

		// console.log('selection states', $scope.state.selectionState, newSelectionState, qlik.currApp().selectionState( ).selections);

		// var selectionChangeFlag = $scope.arraysEqual($scope.state.selectionState, newSelectionState);

		// console.log('status', selectionChangeFlag);


		// // check if selections have changed since last time process was checked
		// if (!selectionChangeFlag) {
		// 	// loop through each selection
		// 	newSelectionState.map((selection) => {
		// 		console.log('selection', selection);
		// 		// store hash value
		// 		var hashed = $scope.hashCode(selection.field);
		// 		// check if hash already exists in table
		// 		if (!$scope.state.hashes[hashed]) {
		// 			console.log('doesnt exist');
		// 			$scope.state.hashes[hashed] = selection;
		// 		} else {
		// 			console.log('exists');
		// 		}
		// 		console.log('final hashes', $scope.state.hashes);

		// 	});

		// var fieldTriggers = $scope.$parent.layout.fieldTrigger;
		// 	// loop through the triggers
		// 	fieldTriggers.map((field) => {
		// 		// hash the field name for a trigger
		// 		var hashed = $scope.hashCode(field.qListObject.qDimensionInfo.qGroupFieldDefs[0]);

		// 		// check to see if a trigger has a matching value in selections
		// 		if (!$scope.state.hashes[hashed]) {
		// 			console.log('found a match');
		// 		} else {
		// 			// if not - do nothing
		// 			console.log('no match');
		// 		}
		// 		// if so - see if the trigger has already been fired

		// 		// if trigger has not yet been fired - fire it

		// 		// if trigger has been fired, move to next trigger

		// 		// need something to flip flag back when selections are unselected
		// 		console.log('field', field.qListObject.qDimensionInfo.qGroupFieldDefs[0], hashed);


		// 	});
		// 	// console.log('new selection state', newSelectionState);
		// }

		// reset selection state to current
		// $scope.state.selectionState = newSelectionState;
		// console.info( 'Validated', fieldTriggers);

	});

	// get selection state

	// store selection state to scope

	// measure current selection state against stored selection state

	// IF - user changed field AND field was tagged for changes
	// DO whatever user asked

	// store updated state to scope


	//$scope.backendApi.selectValues();

	// $scope.dataArr = $scope.layout.qListObject.qDataPages[0].qMatrix;
	// console.log('data call', $scope.dataArr);

	// $scope.$watch('layout.qListObject.qDataPages[0].qMatrix', function (newVal, oldVal) {
	// 	// if (!arraysEqual(oldVal,newVal) && newVal!==undefined){
	// 	let currentTime = new Date;

	// 	if ($scope.timerVars.running!==true) {
	// 		console.log('the data is a changin', newVal, oldVal, currentTime);
	// 		$scope.dataArr = newVal;
	// 	} else {
	// 		console.log('go away, i"m running', currentTime);
	// 	}
	// // let data = dataObj($scope.$parent.layout);
	// // console.log('data change fired', $scope.$parent.layout);
	// // dataChanges(data, $scope.id);
	// // //function to clean up selection classes after data changes
	// // barSelectionClasses($scope.$parent.layout.qHyperCube.qDataPages[0].qMatrix);
	// // }
	// });
};

/***/ })

})
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9jb21wb25lbnRzL3Njb3BlLmpzIl0sIm5hbWVzIjpbIiRzY29wZSIsInN0YXRlIiwidHJpZ2dlcnMiLCJzZWxlY3Rpb25IYXNoZXMiLCJwcm9ncmFtbWljQ2hhbmdlRmxhZyIsImNyZWF0ZVNlbGVjdGlvbk9iaiIsInNlbGVjdGlvbnMiLCJtYXAiLCJzZWxlY3Rpb24iLCJmaWVsZCIsImZpZWxkTmFtZSIsInNlbGVjdGVkIiwicVNlbGVjdGVkIiwiYXJyYXlzRXF1YWwiLCJ4IiwieSIsInVuZGVmaW5lZCIsImNvbnN0cnVjdG9yIiwiRnVuY3Rpb24iLCJSZWdFeHAiLCJ2YWx1ZU9mIiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwiRGF0ZSIsIk9iamVjdCIsInAiLCJrZXlzIiwiZXZlcnkiLCJpIiwiaW5kZXhPZiIsImNyZWF0ZUhhc2giLCJ2YWwiLCJoYXNoIiwiY2hhciIsImNoYXJDb2RlQXQiLCJjcmVhdGVGaWVsZFRyaWdnZXJNYXAiLCJmaWVsZFRyaWdnZXJzIiwidHJpZ2dlciIsInB1c2giLCJxTGlzdE9iamVjdCIsInFEaW1lbnNpb25JbmZvIiwicUdyb3VwRmllbGREZWZzIiwiYWN0aW9uVHlwZSIsImZpZWxkVHJpZ2dlciIsImV2ZW50VHlwZSIsInRhcmdldEZpZWxkIiwidGFyZ2V0RmllbGRTZWFyY2hTdHJpbmciLCJ0cmlnZ2VyRmlyZWQiLCJkaWZmQXJyYXlzIiwiaGFzaEFycmF5IiwiZGlmZkFycmF5IiwiY3VyclNlbGVjdGlvbiIsImZpbHRlciIsInByZXZTZWxlY3Rpb24iLCJydW5UcmlnZ2VyIiwiY29udGV4dCIsImNvbnNvbGUiLCJsb2ciLCJzZWxlY3Rpb25TdGF0ZSIsInNlbCIsImN1cnJBcHAiLCJzZWxlY3RWYWx1ZXMiLCJxVGV4dCIsInNlbGVjdEV4Y2x1ZGVkIiwiY2xlYXIiLCJsb2NrIiwidW5sb2NrIiwic2VsZWN0aW9uTGlzdGVuZXIiLCJuZXdTZWxlY3Rpb25zIiwic2VsZWN0aW9uT2JqIiwic2VsZWN0aW9uQ2hhbmdlRmxhZyIsIiRwYXJlbnQiLCJsYXlvdXQiLCJjbGVhcmVkU2VsZWN0aW9uIiwibWFkZVNlbGVjdGlvbiIsInRhcmdldGVkVHJpZ2dlciIsImluZGl2VHJpZ2dlciIsImZpZWxkQ2hhbmdlIiwiT25EYXRhIiwiYmluZCIsImNvbXBvbmVudCIsIm1vZGVsIiwiVmFsaWRhdGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O2tCQUVlLFVBQUNBLE1BQUQsRUFBWTtBQUMxQjtBQUNBQSxRQUFPQyxLQUFQLEdBQWU7QUFDZEMsWUFBVSxFQURJO0FBRWRDLG1CQUFpQixFQUZIO0FBR2RDLHdCQUFzQjtBQUhSLEVBQWY7O0FBTUE7O0FBRUE7O0FBRUFKLFFBQU9LLGtCQUFQLEdBQTRCLFVBQVdDLFVBQVgsRUFBd0I7QUFDbkQsU0FBT0EsV0FBV0MsR0FBWCxDQUFlLFVBQUNDLFNBQUQsRUFBZTtBQUNwQyxVQUFPO0FBQ05DLFdBQU9ELFVBQVVFLFNBRFg7QUFFTkMsY0FBVUgsVUFBVUk7QUFGZCxJQUFQO0FBSUEsR0FMTSxDQUFQO0FBTUEsRUFQRDs7QUFTQTtBQUNBO0FBQ0E7QUFDQVosUUFBT2EsV0FBUCxHQUFxQixVQUFVQyxDQUFWLEVBQWFDLENBQWIsRUFBZ0I7QUFDcEM7O0FBRUEsTUFBSUQsTUFBTSxJQUFOLElBQWNBLE1BQU1FLFNBQXBCLElBQWlDRCxNQUFNLElBQXZDLElBQStDQSxNQUFNQyxTQUF6RCxFQUFvRTtBQUFFLFVBQU9GLE1BQU1DLENBQWI7QUFBaUI7QUFDdkY7QUFDQSxNQUFJRCxFQUFFRyxXQUFGLEtBQWtCRixFQUFFRSxXQUF4QixFQUFxQztBQUFFLFVBQU8sS0FBUDtBQUFlO0FBQ3REO0FBQ0EsTUFBSUgsYUFBYUksUUFBakIsRUFBMkI7QUFBRSxVQUFPSixNQUFNQyxDQUFiO0FBQWlCO0FBQzlDO0FBQ0EsTUFBSUQsYUFBYUssTUFBakIsRUFBeUI7QUFBRSxVQUFPTCxNQUFNQyxDQUFiO0FBQWlCO0FBQzVDLE1BQUlELE1BQU1DLENB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QXNDMUQsT0FBT0MsS0FBUCxDQUFhMEQsY0FBbkQ7QUFFQTs7QUFFRDNELFFBQU9pRixTQUFQLENBQWlCQyxLQUFqQixDQUF1QkMsU0FBdkIsQ0FBaUNILElBQWpDLENBQXVDLFlBQVk7QUFDbEQ7O0FBRUE7O0FBRUE7O0FBRUE7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7O0FBSUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxFQTVERDs7QUE4REE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7O0FBSUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDIiwiZmlsZSI6IjAuZjZmNWY0MWY4MDMxMGJmOGRiMTAuaG90LXVwZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBxbGlrIGZyb20gJ3FsaWsnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKCRzY29wZSkgPT4ge1xyXG5cdC8vIEluaXRpYWxpemF0aW9uIGNvZGVcclxuXHQkc2NvcGUuc3RhdGUgPSB7XHJcblx0XHR0cmlnZ2VyczogW10sXHJcblx0XHRzZWxlY3Rpb25IYXNoZXM6IHt9LFxyXG5cdFx0cHJvZ3JhbW1pY0NoYW5nZUZsYWc6IGZhbHNlLFxyXG5cdH07XHJcblxyXG5cdC8vIGNvbnNvbGUubG9nKCdzZWxlY3Rpb24gc3RhdGUgY2hlY2snLCAkc2NvcGUuc3RhdGUuc2VsZWN0aW9uU3RhdGUpO1xyXG5cclxuXHQvLyBGdW5jdGlvbnNcclxuXHJcblx0JHNjb3BlLmNyZWF0ZVNlbGVjdGlvbk9iaiA9IGZ1bmN0aW9uICggc2VsZWN0aW9ucyApIHtcclxuXHRcdHJldHVybiBzZWxlY3Rpb25zLm1hcCgoc2VsZWN0aW9uKSA9PiB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0ZmllbGQ6IHNlbGVjdGlvbi5maWVsZE5hbWUsXHJcblx0XHRcdFx0c2VsZWN0ZWQ6IHNlbGVjdGlvbi5xU2VsZWN0ZWQsXHJcblx0XHRcdH07XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cclxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblx0Ly8gQ3JlYXRlIGhlbHBlciBmdW5jdGlvbiBmb3IgYXJyYXkgZXF1YWxpdHkgL1xyXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHQkc2NvcGUuYXJyYXlzRXF1YWwgPSBmdW5jdGlvbiAoeCwgeSkge1xyXG5cdFx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRcdGlmICh4ID09PSBudWxsIHx8IHggPT09IHVuZGVmaW5lZCB8fCB5ID09PSBudWxsIHx8IHkgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4geCA9PT0geTsgfVxyXG5cdFx0Ly8gYWZ0ZXIgdGhpcyBqdXN0IGNoZWNraW5nIHR5cGUgb2Ygb25lIHdvdWxkIGJlIGVub3VnaFxyXG5cdFx0aWYgKHguY29uc3RydWN0b3IgIT09IHkuY29uc3RydWN0b3IpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0XHQvLyBpZiB0aGV5IGFyZSBmdW5jdGlvbnMsIHRoZXkgc2hvdWxkIGV4YWN0bHkgcmVmZXIgdG8gc2FtZSBvbmUgKGJlY2F1c2Ugb2YgY2xvc3VyZXMpXHJcblx0XHRpZiAoeCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7IHJldHVybiB4ID09PSB5OyB9XHJcblx0XHQvLyBpZiB0aGV5IGFyZSByZWdleHBzLCB0aGV5IHNob3VsZCBleGFjdGx5IHJlZmVyIHRvIHNhbWUgb25lIChpdCBpcyBoYXJkIHRvIGJldHRlciBlcXVhbGl0eSBjaGVjayBvbiBjdXJyZW50IEVTKVxyXG5cdFx0aWYgKHggaW5zdGFuY2VvZiBSZWdFeHApIHsgcmV0dXJuIHggPT09IHk7IH1cclxuXHRcdGlmICh4ID09PSB5IHx8IHgudmFsdWVPZigpID09PSB5LnZhbHVlT2YoKSkgeyByZXR1cm4gdHJ1ZTsgfVxyXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoeCkgJiYgeC5sZW5ndGggIT09IHkubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cdFxyXG5cdFx0Ly8gaWYgdGhleSBhcmUgZGF0ZXMsIHRoZXkgbXVzdCBoYWQgZXF1YWwgdmFsdWVPZlxyXG5cdFx0aWYgKHggaW5zdGFuY2VvZiBEYXRlKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cdFxyXG5cdFx0Ly8gaWYgdGhleSBhcmUgc3RyaWN0bHkgZXF1YWwsIHRoZXkgYm90aCBuZWVkIHRvIGJlIG9iamVjdCBhdCBsZWFzdFxyXG5cdFx0aWYgKCEoeCBpbnN0YW5jZW9mIE9iamVjdCkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblx0XHRpZiAoISh5IGluc3RhbmNlb2YgT2JqZWN0KSkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHRcclxuXHRcdC8vIHJlY3Vyc2l2ZSBvYmplY3QgZXF1YWxpdHkgY2hlY2tcclxuXHRcdHZhciBwID0gT2JqZWN0LmtleXMoeCk7XHJcblx0XHRyZXR1cm4gT2JqZWN0LmtleXMoeSkuZXZlcnkoZnVuY3Rpb24gKGkpIHsgcmV0dXJuIHAuaW5kZXhPZihpKSAhPT0gLTE7IH0pICYmXHJcblx0XHRcdHAuZXZlcnkoZnVuY3Rpb24gKGkpIHsgcmV0dXJuICRzY29wZS5hcnJheXNFcXVhbCh4W2ldLCB5W2ldKTsgfSk7XHJcblx0fTtcclxuXHJcblx0JHNjb3BlLmNyZWF0ZUhhc2ggPSBmdW5jdGlvbiggdmFsICkge1xyXG5cdFx0dmFyIGhhc2ggPSAwO1xyXG5cdFx0aWYgKHZhbC5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gaGFzaDtcclxuXHRcdH1cclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmFsLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBjaGFyID0gdmFsLmNoYXJDb2RlQXQoaSk7XHJcblx0XHRcdGhhc2ggPSAoKGhhc2g8PDUpLWhhc2gpK2NoYXI7XHJcblx0XHRcdGhhc2ggPSBoYXNoICYgaGFzaDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gaGFzaDtcclxuXHR9O1xyXG5cclxuXHQkc2NvcGUuY3JlYXRlRmllbGRUcmlnZ2VyTWFwID0gZnVuY3Rpb24gKCBmaWVsZFRyaWdnZXJzICkge1xyXG5cclxuXHRcdC8vIGNsZWFyIHRyaWdnZXIgYXJyYXkgaW4gY2FzZSB0cmlnZ2VycyB3ZXJlIHJlbW92ZWRcclxuXHRcdCRzY29wZS5zdGF0ZS50cmlnZ2VycyA9IFtdO1xyXG5cclxuXHRcdC8vIGxvb3AgdGhyb3VnaCBlYWNoIGZpZWxkIHRyaWdnZXIgYW5kIGNyZWF0ZSBhIGNsZWFuIHJlY29yZFxyXG5cdFx0ZmllbGRUcmlnZ2Vycy5tYXAoKHRyaWdnZXIpID0+IHtcclxuXHRcdFx0JHNjb3BlLnN0YXRlLnRyaWdnZXJzLnB1c2goe1xyXG5cdFx0XHRcdGZpZWxkOiB0cmlnZ2VyLnFMaXN0T2JqZWN0LnFEaW1lbnNpb25JbmZvLnFHcm91cEZpZWxkRGVmc1swXSxcclxuXHRcdFx0XHRhY3Rpb25UeXBlOiB0cmlnZ2VyLmZpZWxkVHJpZ2dlci5hY3Rpb25UeXBlLFxyXG5cdFx0XHRcdGV2ZW50VHlwZTogdHJpZ2dlci5maWVsZFRyaWdnZXIuZXZlbnRUeXBlLFxyXG5cdFx0XHRcdHRhcmdldEZpZWxkOiB0cmlnZ2VyLmZpZWxkVHJpZ2dlci50YXJnZXRGaWVsZCxcclxuXHRcdFx0XHR0YXJnZXRGaWVsZFNlYXJjaFN0cmluZzogdHJpZ2dlci5maWVsZFRyaWdnZXIudGFyZ2V0RmllbGRTZWFyY2hTdHJpbmcsXHJcblx0XHRcdFx0dHJpZ2dlckZpcmVkOiBmYWxzZSxcclxuXHRcdFx0fSk7XHJcblx0XHJcblx0XHR9KTtcclxuXHRcdC8vIGNvbnNvbGUubG9nKCdmaW5hbCBoYXNoZXMnLCAkc2NvcGUuc3RhdGUudHJpZ2dlcnMpO1xyXG5cdH07XHJcblxyXG5cdCRzY29wZS5kaWZmQXJyYXlzID0gZnVuY3Rpb24gKGhhc2hBcnJheSwgZGlmZkFycmF5KSB7XHJcblx0XHQvLyBoYXNoIG5ld2VzdCBzZWxlY3Rpb25zXHJcblx0XHQvLyBjb25zb2xlLmxvZygnaGFzaEFycmF5JywgaGFzaEFycmF5LCAnZGlmZkFycmF5JywgZGlmZkFycmF5KTtcclxuXHRcdCRzY29wZS5zdGF0ZS5zZWxlY3Rpb25IYXNoZXMgPSB7fTtcclxuXHRcdGhhc2hBcnJheS5tYXAoKGN1cnJTZWxlY3Rpb24pID0+IHtcclxuXHRcdFx0JHNjb3BlLnN0YXRlLnNlbGVjdGlvbkhhc2hlc1soY3VyclNlbGVjdGlvbi5maWVsZCArICd8JyArIGN1cnJTZWxlY3Rpb24uc2VsZWN0ZWQpXSA9IGN1cnJTZWxlY3Rpb247XHJcblx0XHR9KTtcclxuXHJcblx0XHRkaWZmQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKHByZXZTZWxlY3Rpb24pIHtcclxuXHRcdFx0cmV0dXJuICEkc2NvcGUuc3RhdGUuc2VsZWN0aW9uSGFzaGVzWyhwcmV2U2VsZWN0aW9uLmZpZWxkICsgJ3wnICsgcHJldlNlbGVjdGlvbi5zZWxlY3RlZCldO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gY29uc29sZS5sb2coJ25vdCBmb3VuZCBzZWxlY3Rpb25zJywgZGlmZkFycmF5KTtcclxuXHRcdHJldHVybiBkaWZmQXJyYXk7XHJcblx0XHQvLyBkaWZmQXJyYXkubWFwKChwcmV2U2VsZWN0aW9uKSA9PiB7XHJcblx0XHQvLyBcdGNvbnNvbGUubG9nKCdwcmV2IHNlbCBoYXNoZXMnLCAkc2NvcGUuc3RhdGUuc2VsZWN0aW9uSGFzaGVzWygkc2NvcGUuY3JlYXRlSGFzaChwcmV2U2VsZWN0aW9uLmZpZWxkICsgJ3wnICsgcHJldlNlbGVjdGlvbi5zZWxlY3RlZCkpXSwgcHJldlNlbGVjdGlvbik7XHJcblx0XHQvLyBcdGlmICghJHNjb3BlLnN0YXRlLnNlbGVjdGlvbkhhc2hlc1soJHNjb3BlLmNyZWF0ZUhhc2gocHJldlNlbGVjdGlvbi5maWVsZCArICd8JyArIHByZXZTZWxlY3Rpb24uc2VsZWN0ZWQpKV0pIHtcclxuXHRcdFx0XHRcclxuXHRcdC8vIFx0XHRyZXR1cm4gcHJldlNlbGVjdGlvbjtcclxuXHRcdC8vIFx0fVxyXG5cdFx0Ly8gfSk7XHJcblxyXG5cdFx0Ly8gY29uc29sZS5sb2coJ2hhc2ggdGFibGUnLCAkc2NvcGUuc3RhdGUuc2VsZWN0aW9uSGFzaGVzKTtcclxuXHR9O1xyXG5cclxuXHQkc2NvcGUucnVuVHJpZ2dlciA9IGZ1bmN0aW9uICggdHJpZ2dlciwgY29udGV4dCApIHtcclxuXHRcdGNvbnNvbGUubG9nKCd0cmlnZ2VyIGNhbGxlZCcsIHRyaWdnZXIsIGNvbnRleHQpO1xyXG5cclxuXHRcdCRzY29wZS5zdGF0ZS5zZWxlY3Rpb25TdGF0ZS5zZWxlY3Rpb25zLm1hcCgoc2VsKSA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdzZWxlY3Rpb25zJywgc2VsKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHN3aXRjaCAodHJpZ2dlci5hY3Rpb25UeXBlKSB7XHJcblx0XHRjYXNlICdzZWxlY3RGaWVsZCc6XHJcblx0XHRcdGNvbnNvbGUubG9nKCdzZWxlY3Rpb24nKTtcclxuXHRcdFx0JHNjb3BlLnN0YXRlLnByb2dyYW1taWNDaGFuZ2VGbGFnID0gdHJ1ZTtcclxuXHRcdFx0cWxpay5jdXJyQXBwKCkuZmllbGQodHJpZ2dlci50YXJnZXRGaWVsZCkuc2VsZWN0VmFsdWVzKFt7cVRleHQ6IHRyaWdnZXIudGFyZ2V0RmllbGRTZWFyY2hTdHJpbmd9XSwgdHJ1ZSwgdHJ1ZSk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAnc2VsZWN0RXhjbHVkZWQnOlxyXG5cdFx0XHQkc2NvcGUuc3RhdGUucHJvZ3JhbW1pY0NoYW5nZUZsYWcgPSB0cnVlO1xyXG5cdFx0XHRxbGlrLmN1cnJBcHAoKS5maWVsZCh0cmlnZ2VyLnRhcmdldEZpZWxkKS5zZWxlY3RFeGNsdWRlZCgpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdGNhc2UgJ3NlbGVjdFBvc3NpYmxlJzpcclxuXHRcdFx0Y29uc29sZS5sb2coJ3NlbGVjdGlvbiBwb3MnKTtcclxuXHRcdFx0JHNjb3BlLnN0YXRlLnByb2dyYW1taWNDaGFuZ2VGbGFnID0gdHJ1ZTtcclxuXHRcdFx0cWxpay5jdXJyQXBwKCkuZmllbGQodHJpZ2dlci50YXJnZXRGaWVsZCkuc2VsZWN0RXhjbHVkZWQoKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlICdjbGVhckZpZWxkJzpcclxuXHRcdFx0JHNjb3BlLnN0YXRlLnByb2dyYW1taWNDaGFuZ2VGbGFnID0gdHJ1ZTtcclxuXHRcdFx0cWxpay5jdXJyQXBwKCkuZmllbGQodHJpZ2dlci50YXJnZXRGaWVsZCkuY2xlYXIoKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRjYXNlICdsb2NrRmllbGQnOlxyXG5cdFx0XHQkc2NvcGUuc3RhdGUucHJvZ3JhbW1pY0NoYW5nZUZsYWcgPSB0cnVlO1xyXG5cdFx0XHRxbGlrLmN1cnJBcHAoKS5maWVsZCh0cmlnZ2VyLnRhcmdldEZpZWxkKS5sb2NrKCk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0Y2FzZSAndW5sb2NrRmllbGQnOlxyXG5cdFx0XHQkc2NvcGUuc3RhdGUucHJvZ3JhbW1pY0NoYW5nZUZsYWcgPSB0cnVlO1xyXG5cdFx0XHRxbGlrLmN1cnJBcHAoKS5maWVsZCh0cmlnZ2VyLnRhcmdldEZpZWxkKS51bmxvY2soKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHRjb25zb2xlLmxvZygnbm9ib2R5IGhvbWUgb24gdGhlc2UgdHJpZ2dlcnMnKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fTtcclxuXHQvLyAkc2NvcGUuY29tcG9uZW50Lm1vZGVsLkludmFsaWRhdGVkLmJpbmQoIGZ1bmN0aW9uICgpIHtcclxuXHQvLyBcdGNvbnNvbGUuaW5mbyggJ0ludmFsaWRhdGVkJyApO1xyXG5cdC8vIFx0JHNjb3BlLnN0YXRlLnByZXZTZWxlY3Rpb25TdGF0ZSA9ICRzY29wZS5zdGF0ZS5zZWxlY3Rpb25TdGF0ZTtcclxuXHQvLyB9ICk7XHJcblx0JHNjb3BlLnNlbGVjdGlvbkxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRjb25zb2xlLmxvZygnY2hhbmdlIHR5cGUnLCAkc2NvcGUuc3RhdGUucHJvZ3JhbW1pY0NoYW5nZUZsYWcpO1xyXG5cdFx0aWYgKCRzY29wZS5zdGF0ZS5wcm9ncmFtbWljQ2hhbmdlRmxhZykge1xyXG5cdFx0XHQkc2NvcGUuc3RhdGUucHJvZ3JhbW1pY0NoYW5nZUZsYWcgPSBmYWxzZTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0Y29uc29sZS5sb2coJ3Byb2cgZmxhZyBhZnRlciBmaWVsZCBzZWxlY3Rpb24nLCAkc2NvcGUuc3RhdGUucHJvZ3JhbW1pY0NoYW5nZUZsYWcpO1xyXG5cclxuXHRcdHZhciBuZXdTZWxlY3Rpb25zID0gJHNjb3BlLmNyZWF0ZVNlbGVjdGlvbk9iaigkc2NvcGUuc3RhdGUuc2VsZWN0aW9uU3RhdGUuc2VsZWN0aW9ucyk7XHJcblx0XHRjb25zb2xlLmxvZygnZXZlbnQnLCAkc2NvcGUuc3RhdGUuc2VsZWN0aW9uU3RhdGUsICduZXdPYmonLCBuZXdTZWxlY3Rpb25zLCAncHJldk9iaicsICRzY29wZS5zdGF0ZS5zZWxlY3Rpb25PYmopO1xyXG5cdFx0Y29uc29sZS5sb2coJ3Njb3BlJywgJHNjb3BlKTtcclxuXHJcblx0XHQvLyBjaGVjayBpZiBuZXcgc2VsZWN0aW9ucyBhbmQgb2xkIHNlbGVjdGlvbnMgYXJlIHRoZSBzYW1lXHJcblx0XHR2YXIgc2VsZWN0aW9uQ2hhbmdlRmxhZyA9ICRzY29wZS5hcnJheXNFcXVhbCgkc2NvcGUuc3RhdGUuc2VsZWN0aW9uT2JqLCBuZXdTZWxlY3Rpb25zKTtcclxuXHRcdC8vIGNvbnNvbGUubG9nKCdzdGF0dXMnLCBzZWxlY3Rpb25DaGFuZ2VGbGFnKTtcclxuXHJcblx0XHRcclxuXHRcdC8vIGNoZWNrIGlmIHNlbGVjdGlvbnMgaGF2ZSBjaGFuZ2VkIHNpbmNlIGxhc3QgdGltZSBwcm9jZXNzIHdhcyBjaGVja2VkXHJcblx0XHRpZiAoc2VsZWN0aW9uQ2hhbmdlRmxhZz09PWZhbHNlKSB7XHJcblxyXG5cdFx0XHQkc2NvcGUuY3JlYXRlRmllbGRUcmlnZ2VyTWFwKCRzY29wZS4kcGFyZW50LmxheW91dC5maWVsZFRyaWdnZXIpO1xyXG5cdFx0XHRjb25zb2xlLmxvZygkc2NvcGUuJHBhcmVudC5sYXlvdXQuZmllbGRUcmlnZ2VyKTtcclxuXHJcblx0XHRcdFxyXG5cclxuXHRcdFx0Ly8gZGlmZiBzZWxlY3Rpb25zIHRvIGNhdGNoIG5ld2VzdCBzZWxlY3Rpb24vY2xlYVxyXG5cdFx0XHQvLyBjaGVjayBjb3VudHMsIGlmIG5ldyA+IG9sZCB0aGVuIG5ldyBzZWxlY3Rpb24sIGlmIG9sZCA8IG5ldyB0aGVuIGNsZWFyZWRcclxuXHRcdFx0Ly8gaWYgY291bnRzIGVxdWFsLCBsb29wIHRocm91Z2ggbmV3IGFuZCBpbm5lciBsb29wIHRocm91Z2ggb2xkIGNoZWNraW5nIHZhbHVlc1xyXG5cdFx0XHRpZiAoJHNjb3BlLnN0YXRlLnNlbGVjdGlvbk9iai5sZW5ndGg+bmV3U2VsZWN0aW9ucy5sZW5ndGgpIHtcclxuXHRcdFx0XHQvLyBzZWxlY3Rpb24gY2xlYXJlZFxyXG5cdFx0XHRcdHZhciBjbGVhcmVkU2VsZWN0aW9uID0gJHNjb3BlLmRpZmZBcnJheXMobmV3U2VsZWN0aW9ucywgJHNjb3BlLnN0YXRlLnNlbGVjdGlvbk9iaik7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ3NlbGVjdGlvbiBjbGVhcmVkJywgY2xlYXJlZFNlbGVjdGlvbik7XHJcblxyXG5cdFx0XHR9IGVsc2UgaWYgKCRzY29wZS5zdGF0ZS5zZWxlY3Rpb25PYmoubGVuZ3RoPG5ld1NlbGVjdGlvbnMubGVuZ3RoKSB7XHJcblx0XHRcdFx0Ly8gc2VsZWN0aW9uIG1hZGVcclxuXHRcdFx0XHR2YXIgbWFkZVNlbGVjdGlvbiA9ICRzY29wZS5kaWZmQXJyYXlzKCRzY29wZS5zdGF0ZS5zZWxlY3Rpb25PYmosIG5ld1NlbGVjdGlvbnMpO1xyXG5cclxuXHRcdFx0XHR2YXIgdGFyZ2V0ZWRUcmlnZ2VyID0gJHNjb3BlLnN0YXRlLnRyaWdnZXJzLmZpbHRlcigodHJpZ2dlcikgPT4ge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRyaWdnZXIuZmllbGQ9PT1tYWRlU2VsZWN0aW9uWzBdLmZpZWxkO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRjb25zb2xlLmxvZygnc2VsZWN0aW9uIG1hZGUnLCBtYWRlU2VsZWN0aW9uLCAndGFyZ2V0JywgdGFyZ2V0ZWRUcmlnZ2VyKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0YXJnZXRlZFRyaWdnZXIubWFwKChpbmRpdlRyaWdnZXIpID0+IHtcclxuXHRcdFx0XHRcdCRzY29wZS5ydW5UcmlnZ2VyKGluZGl2VHJpZ2dlciwgbWFkZVNlbGVjdGlvblswXS5maWVsZCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSBpZiAoJHNjb3BlLmFycmF5c0VxdWFsKCRzY29wZS5zdGF0ZS5zZWxlY3Rpb25PYmosIG5ld1NlbGVjdGlvbnMpKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ3doYXQgYXJlIHlvdSBkb2luZyBoZXJlISB0aGVzZSBhcnJheXMgYXJlIHRoZSBzYW1lJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gY2hlY2sgd2hpY2ggdmFsdWVzIHdlcmUgY2xlYXJlZCBvciBtYWRlXHJcblx0XHRcdFx0dmFyIGZpZWxkQ2hhbmdlID0gJHNjb3BlLmRpZmZBcnJheXMobmV3U2VsZWN0aW9ucywgJHNjb3BlLnN0YXRlLnNlbGVjdGlvbk9iaik7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2NoYW5nZXMgaW4gZmllbGQnLCBmaWVsZENoYW5nZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQkc2NvcGUuc3RhdGUuc2VsZWN0aW9uT2JqID0gbmV3U2VsZWN0aW9ucztcclxuXHJcblx0XHQvLyBydW4gYmVsb3cgZm9yIG5ldyBzZWxlY3Rpb25cclxuXHJcblx0XHQvLyBjaGVjayBpZiBzZWxlY3Rpb24gaW4gdHJpZ2dlcnNcclxuXHJcblx0XHQvLyBpZiBpbiB0cmlnZ2VycyBhbmQgdW5maXJlZCwgZmlyZSBhbmQgZmxpcCBmbGFnXHJcblxyXG5cdFx0Ly8gaWYgaW4gdHJpZ2dlcnMgYW5kIGZpcmVkLCBkbyBub3RoaW5nXHJcblxyXG5cdFx0Ly8gaWYgbm90IGluIHRyaWdnZXJzIC0gZG8gbm90aGluZ1xyXG5cclxuXHRcdC8vdW5yZWdpc3RlciB0aGUgbGlzdGVuZXIgd2hlbiBubyBsb25nZXIgbm90aWZpY2F0aW9uIGlzIG5lZWRlZC5cclxuXHRcdC8vICRzY29wZS5zdGF0ZS5zZWxlY3Rpb25TdGF0ZS5PbkRhdGEudW5iaW5kKCAkc2NvcGUuc2VsZWN0aW9uTGlzdGVuZXIgKTtcclxuXHR9O1xyXG5cclxuXHQvLyBzZXQgaW5pdGlhbCBzY29wZSBzdGF0ZSBmb3Igc2VsZWN0aW9uc1xyXG5cdGlmICghJHNjb3BlLnN0YXRlLnNlbGVjdGlvblN0YXRlKSB7XHJcblxyXG5cdFx0JHNjb3BlLnN0YXRlLnNlbGVjdGlvblN0YXRlID0gcWxpay5jdXJyQXBwKCkuc2VsZWN0aW9uU3RhdGUoICk7XHJcblx0XHQkc2NvcGUuc3RhdGUuc2VsZWN0aW9uU3RhdGUuT25EYXRhLmJpbmQoICRzY29wZS5zZWxlY3Rpb25MaXN0ZW5lciApO1xyXG5cclxuXHRcdCRzY29wZS5zdGF0ZS5zZWxlY3Rpb25PYmogPSAkc2NvcGUuY3JlYXRlU2VsZWN0aW9uT2JqKCRzY29wZS5zdGF0ZS5zZWxlY3Rpb25TdGF0ZS5zZWxlY3Rpb25zKTtcclxuXHJcblxyXG5cdFx0Y29uc29sZS5sb2coJ2luaXRhbCBzZWxlY3Rpb24gc3RhdGUnLCAkc2NvcGUuc3RhdGUuc2VsZWN0aW9uU3RhdGUpO1xyXG5cclxuXHR9XHJcblxyXG5cdCRzY29wZS5jb21wb25lbnQubW9kZWwuVmFsaWRhdGVkLmJpbmQoIGZ1bmN0aW9uICgpIHtcclxuXHRcdC8vIHZhciBuZXdTZWxlY3Rpb25TdGF0ZSA9IHFsaWsuY3VyckFwcCgpLnNlbGVjdGlvblN0YXRlKCApLnNlbGVjdGlvbnM7XHJcblxyXG5cdFx0Ly8gY29uc29sZS5sb2coJ3NlbGVjdGlvbiBzdGF0ZXMnLCAkc2NvcGUuc3RhdGUuc2VsZWN0aW9uU3RhdGUsIG5ld1NlbGVjdGlvblN0YXRlLCBxbGlrLmN1cnJBcHAoKS5zZWxlY3Rpb25TdGF0ZSggKS5zZWxlY3Rpb25zKTtcclxuXHRcdFxyXG5cdFx0Ly8gdmFyIHNlbGVjdGlvbkNoYW5nZUZsYWcgPSAkc2NvcGUuYXJyYXlzRXF1YWwoJHNjb3BlLnN0YXRlLnNlbGVjdGlvblN0YXRlLCBuZXdTZWxlY3Rpb25TdGF0ZSk7XHJcblxyXG5cdFx0Ly8gY29uc29sZS5sb2coJ3N0YXR1cycsIHNlbGVjdGlvbkNoYW5nZUZsYWcpO1xyXG5cclxuXHJcblx0XHQvLyAvLyBjaGVjayBpZiBzZWxlY3Rpb25zIGhhdmUgY2hhbmdlZCBzaW5jZSBsYXN0IHRpbWUgcHJvY2VzcyB3YXMgY2hlY2tlZFxyXG5cdFx0Ly8gaWYgKCFzZWxlY3Rpb25DaGFuZ2VGbGFnKSB7XHJcblx0XHQvLyBcdC8vIGxvb3AgdGhyb3VnaCBlYWNoIHNlbGVjdGlvblxyXG5cdFx0Ly8gXHRuZXdTZWxlY3Rpb25TdGF0ZS5tYXAoKHNlbGVjdGlvbikgPT4ge1xyXG5cdFx0Ly8gXHRcdGNvbnNvbGUubG9nKCdzZWxlY3Rpb24nLCBzZWxlY3Rpb24pO1xyXG5cdFx0Ly8gXHRcdC8vIHN0b3JlIGhhc2ggdmFsdWVcclxuXHRcdC8vIFx0XHR2YXIgaGFzaGVkID0gJHNjb3BlLmhhc2hDb2RlKHNlbGVjdGlvbi5maWVsZCk7XHJcblx0XHQvLyBcdFx0Ly8gY2hlY2sgaWYgaGFzaCBhbHJlYWR5IGV4aXN0cyBpbiB0YWJsZVxyXG5cdFx0Ly8gXHRcdGlmICghJHNjb3BlLnN0YXRlLmhhc2hlc1toYXNoZWRdKSB7XHJcblx0XHQvLyBcdFx0XHRjb25zb2xlLmxvZygnZG9lc250IGV4aXN0Jyk7XHJcblx0XHQvLyBcdFx0XHQkc2NvcGUuc3RhdGUuaGFzaGVzW2hhc2hlZF0gPSBzZWxlY3Rpb247XHJcblx0XHQvLyBcdFx0fSBlbHNlIHtcclxuXHRcdC8vIFx0XHRcdGNvbnNvbGUubG9nKCdleGlzdHMnKTtcclxuXHRcdC8vIFx0XHR9XHJcblx0XHQvLyBcdFx0Y29uc29sZS5sb2coJ2ZpbmFsIGhhc2hlcycsICRzY29wZS5zdGF0ZS5oYXNoZXMpO1xyXG5cdFx0XHRcdFxyXG5cdFx0Ly8gXHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gdmFyIGZpZWxkVHJpZ2dlcnMgPSAkc2NvcGUuJHBhcmVudC5sYXlvdXQuZmllbGRUcmlnZ2VyO1xyXG5cdFx0Ly8gXHQvLyBsb29wIHRocm91Z2ggdGhlIHRyaWdnZXJzXHJcblx0XHQvLyBcdGZpZWxkVHJpZ2dlcnMubWFwKChmaWVsZCkgPT4ge1xyXG5cdFx0Ly8gXHRcdC8vIGhhc2ggdGhlIGZpZWxkIG5hbWUgZm9yIGEgdHJpZ2dlclxyXG5cdFx0Ly8gXHRcdHZhciBoYXNoZWQgPSAkc2NvcGUuaGFzaENvZGUoZmllbGQucUxpc3RPYmplY3QucURpbWVuc2lvbkluZm8ucUdyb3VwRmllbGREZWZzWzBdKTtcclxuXHJcblx0XHQvLyBcdFx0Ly8gY2hlY2sgdG8gc2VlIGlmIGEgdHJpZ2dlciBoYXMgYSBtYXRjaGluZyB2YWx1ZSBpbiBzZWxlY3Rpb25zXHJcblx0XHQvLyBcdFx0aWYgKCEkc2NvcGUuc3RhdGUuaGFzaGVzW2hhc2hlZF0pIHtcclxuXHRcdC8vIFx0XHRcdGNvbnNvbGUubG9nKCdmb3VuZCBhIG1hdGNoJyk7XHJcblx0XHQvLyBcdFx0fSBlbHNlIHtcclxuXHRcdC8vIFx0XHRcdC8vIGlmIG5vdCAtIGRvIG5vdGhpbmdcclxuXHRcdC8vIFx0XHRcdGNvbnNvbGUubG9nKCdubyBtYXRjaCcpO1xyXG5cdFx0Ly8gXHRcdH1cclxuXHRcdC8vIFx0XHQvLyBpZiBzbyAtIHNlZSBpZiB0aGUgdHJpZ2dlciBoYXMgYWxyZWFkeSBiZWVuIGZpcmVkXHJcblxyXG5cdFx0Ly8gXHRcdC8vIGlmIHRyaWdnZXIgaGFzIG5vdCB5ZXQgYmVlbiBmaXJlZCAtIGZpcmUgaXRcclxuXHJcblx0XHQvLyBcdFx0Ly8gaWYgdHJpZ2dlciBoYXMgYmVlbiBmaXJlZCwgbW92ZSB0byBuZXh0IHRyaWdnZXJcclxuXHJcblx0XHQvLyBcdFx0Ly8gbmVlZCBzb21ldGhpbmcgdG8gZmxpcCBmbGFnIGJhY2sgd2hlbiBzZWxlY3Rpb25zIGFyZSB1bnNlbGVjdGVkXHJcblx0XHQvLyBcdFx0Y29uc29sZS5sb2coJ2ZpZWxkJywgZmllbGQucUxpc3RPYmplY3QucURpbWVuc2lvbkluZm8ucUdyb3VwRmllbGREZWZzWzBdLCBoYXNoZWQpO1xyXG5cclxuXHJcblxyXG5cdFx0Ly8gXHR9KTtcclxuXHRcdC8vIFx0Ly8gY29uc29sZS5sb2coJ25ldyBzZWxlY3Rpb24gc3RhdGUnLCBuZXdTZWxlY3Rpb25TdGF0ZSk7XHJcblx0XHQvLyB9XHJcblxyXG5cdFx0Ly8gcmVzZXQgc2VsZWN0aW9uIHN0YXRlIHRvIGN1cnJlbnRcclxuXHRcdC8vICRzY29wZS5zdGF0ZS5zZWxlY3Rpb25TdGF0ZSA9IG5ld1NlbGVjdGlvblN0YXRlO1xyXG5cdFx0Ly8gY29uc29sZS5pbmZvKCAnVmFsaWRhdGVkJywgZmllbGRUcmlnZ2Vycyk7XHJcblx0XHRcclxuXHR9ICk7XHJcblxyXG5cdC8vIGdldCBzZWxlY3Rpb24gc3RhdGVcclxuXHJcblx0Ly8gc3RvcmUgc2VsZWN0aW9uIHN0YXRlIHRvIHNjb3BlXHJcblxyXG5cdC8vIG1lYXN1cmUgY3VycmVudCBzZWxlY3Rpb24gc3RhdGUgYWdhaW5zdCBzdG9yZWQgc2VsZWN0aW9uIHN0YXRlXHJcblxyXG5cdC8vIElGIC0gdXNlciBjaGFuZ2VkIGZpZWxkIEFORCBmaWVsZCB3YXMgdGFnZ2VkIGZvciBjaGFuZ2VzXHJcblx0Ly8gRE8gd2hhdGV2ZXIgdXNlciBhc2tlZFxyXG5cclxuXHQvLyBzdG9yZSB1cGRhdGVkIHN0YXRlIHRvIHNjb3BlXHJcblxyXG5cclxuXHJcblx0Ly8kc2NvcGUuYmFja2VuZEFwaS5zZWxlY3RWYWx1ZXMoKTtcclxuXHJcblx0Ly8gJHNjb3BlLmRhdGFBcnIgPSAkc2NvcGUubGF5b3V0LnFMaXN0T2JqZWN0LnFEYXRhUGFnZXNbMF0ucU1hdHJpeDtcclxuXHQvLyBjb25zb2xlLmxvZygnZGF0YSBjYWxsJywgJHNjb3BlLmRhdGFBcnIpO1xyXG5cclxuXHQvLyAkc2NvcGUuJHdhdGNoKCdsYXlvdXQucUxpc3RPYmplY3QucURhdGFQYWdlc1swXS5xTWF0cml4JywgZnVuY3Rpb24gKG5ld1ZhbCwgb2xkVmFsKSB7XHJcblx0Ly8gXHQvLyBpZiAoIWFycmF5c0VxdWFsKG9sZFZhbCxuZXdWYWwpICYmIG5ld1ZhbCE9PXVuZGVmaW5lZCl7XHJcblx0Ly8gXHRsZXQgY3VycmVudFRpbWUgPSBuZXcgRGF0ZTtcclxuXHJcblx0Ly8gXHRpZiAoJHNjb3BlLnRpbWVyVmFycy5ydW5uaW5nIT09dHJ1ZSkge1xyXG5cdC8vIFx0XHRjb25zb2xlLmxvZygndGhlIGRhdGEgaXMgYSBjaGFuZ2luJywgbmV3VmFsLCBvbGRWYWwsIGN1cnJlbnRUaW1lKTtcclxuXHQvLyBcdFx0JHNjb3BlLmRhdGFBcnIgPSBuZXdWYWw7XHJcblx0Ly8gXHR9IGVsc2Uge1xyXG5cdC8vIFx0XHRjb25zb2xlLmxvZygnZ28gYXdheSwgaVwibSBydW5uaW5nJywgY3VycmVudFRpbWUpO1xyXG5cdC8vIFx0fVxyXG5cdC8vIC8vIGxldCBkYXRhID0gZGF0YU9iaigkc2NvcGUuJHBhcmVudC5sYXlvdXQpO1xyXG5cdC8vIC8vIGNvbnNvbGUubG9nKCdkYXRhIGNoYW5nZSBmaXJlZCcsICRzY29wZS4kcGFyZW50LmxheW91dCk7XHJcblx0Ly8gLy8gZGF0YUNoYW5nZXMoZGF0YSwgJHNjb3BlLmlkKTtcclxuXHQvLyAvLyAvL2Z1bmN0aW9uIHRvIGNsZWFuIHVwIHNlbGVjdGlvbiBjbGFzc2VzIGFmdGVyIGRhdGEgY2hhbmdlc1xyXG5cdC8vIC8vIGJhclNlbGVjdGlvbkNsYXNzZXMoJHNjb3BlLiRwYXJlbnQubGF5b3V0LnFIeXBlckN1YmUucURhdGFQYWdlc1swXS5xTWF0cml4KTtcclxuXHQvLyAvLyB9XHJcblx0Ly8gfSk7XHJcbn07XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vY29tcG9uZW50cy9zY29wZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=