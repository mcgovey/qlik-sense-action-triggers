import qlik from 'qlik';

export default ($scope) => {
	// Initialization code
	$scope.state = {
		triggers: [],
	};

	console.log('selection state check', $scope.state.selectionState);

	// Functions

	$scope.createSelectionObj = function ( selections ) {
		return selections.map((selection) => {
			return {
				field: selection.fieldName,
				selected: selection.qSelected,
			};
		});
	};

	//////////////////////////////////////////////
	// Create helper function for array equality /
	//////////////////////////////////////////////
	$scope.arraysEqual = function (x, y) {
		// if (a === b) return true;
		// if (a == null || b == null) return false;
		// if (a.length != b.length) return false;
  
		// for (var i = 0; i < a.length; ++i) {
		// 	//if nested array - recurse the value
		// 	if (a[i] instanceof Array && b[i] instanceof Array) {
		// 		$scope.arraysEqual(a[i], b[i]);
		// 	}
		// 	else if (a[i] !== b[i]) {
		// 		return false;
		// 	}
		// }
		// return true;
		
		'use strict';

		if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
		// after this just checking type of one would be enough
		if (x.constructor !== y.constructor) { return false; }
		// if they are functions, they should exactly refer to same one (because of closures)
		if (x instanceof Function) { return x === y; }
		// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
		if (x instanceof RegExp) { return x === y; }
		if (x === y || x.valueOf() === y.valueOf()) { return true; }
		if (Array.isArray(x) && x.length !== y.length) { return false; }
	
		// if they are dates, they must had equal valueOf
		if (x instanceof Date) { return false; }
	
		// if they are strictly equal, they both need to be object at least
		if (!(x instanceof Object)) { return false; }
		if (!(y instanceof Object)) { return false; }
	
		// recursive object equality check
		var p = Object.keys(x);
		return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
			p.every(function (i) { return $scope.arraysEqual(x[i], y[i]); });
	};

	$scope.hashCode = function( val ) {
		var hash = 0;
		if (val.length == 0) {
			return hash;
		}
		for (var i = 0; i < val.length; i++) {
			var char = val.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	};
	// $scope.component.model.Invalidated.bind( function () {
	// 	console.info( 'Invalidated' );
	// 	$scope.state.prevSelectionState = $scope.state.selectionState;
	// } );
	$scope.selectionListener = function() {
		var newSelections = $scope.createSelectionObj($scope.state.selectionState.selections);
		console.log('Back count:', $scope.state.selectionState.backCount, 'event', $scope.state.selectionState, 'newObj', newSelections, 'prevObj', $scope.state.selectionObj);

		// check if new selections and old selections are the same
		var selectionChangeFlag = $scope.arraysEqual($scope.state.selectionState, newSelections);
		console.log('status', selectionChangeFlag);

		
		// check if selections have changed since last time process was checked
		if (!selectionChangeFlag) {
			var fieldTriggers = $scope.$parent.layout.fieldTrigger;
			console.log($scope.state.triggers);

			// clear trigger array in case triggers were removed
			$scope.state.triggers = [];

			// loop through each field trigger
			fieldTriggers.map((trigger) => {
				console.log('trigger', trigger);

				$scope.state.triggers.push({
					field: trigger.qListObject.qDimensionInfo.qGroupFieldDefs[0],
					actionType: trigger.fieldTrigger.actionType,
					eventType: trigger.fieldTrigger.eventType,
					targetField: trigger.fieldTrigger.targetField,
					targetFieldSearchString: trigger.fieldTrigger.targetFieldSearchString,
					triggerFired: false,
				});
		
			});
			console.log('final hashes', $scope.state.triggers);
		}

		// diff selections to catch newest selection/clear

		// check counts, if new > old then new selection, if old < new then cleared
		// if counts equal, loop through new and inner loop through old checking values

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

		$scope.state.selectionState = qlik.currApp().selectionState( );
		$scope.state.selectionState.OnData.bind( $scope.selectionListener );

		$scope.state.selectionObj = $scope.createSelectionObj($scope.state.selectionState.selections);


		console.log('inital selection state', $scope.state.selectionState);

	}

	$scope.component.model.Validated.bind( function () {
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
		
	} );

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