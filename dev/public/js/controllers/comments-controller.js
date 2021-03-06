(function(app) {
	app.config(function(localStorageServiceProvider,$mdThemingProvider){
		  localStorageServiceProvider.setPrefix("Comments");	// avoid overwriting any local storage variables from the rest of your app
		  localStorageServiceProvider.setNotify(true,true);		// broadcast on $rootScope for setItem & removeItem
		      $mdThemingProvider.theme('indigo')				// define theme for main page
			  .primaryPalette('indigo')
			  .accentPalette('pink')
			  .warnPalette('blue');
			
			$mdThemingProvider.theme('lime')					// define theme for pop-up
			  .primaryPalette('lime')
			  .accentPalette('pink')
			  .warnPalette('blue');
	  });
	app.controller('commentsController', function($scope,$rootScope, $mdDialog,localStorageService,$http) {
			localStorageService.clearAll();
			$scope.appTitle = "comments view";
			$scope.appSubTitle = "Comments List";
			$scope.AllComments = localStorageService.get('AllComments');
			
			console.log('AllComments bEFOREEEEEE  '+$scope.AllComments);
			console.log('localstorage bEFOREEEEEE  '+localStorageService.get('AllComments'));
			
			$scope.AllComments = ( localStorageService.get('AllComments') !== null ) ?					// check if there any data at localStorage
							JSON.parse($scope.AllComments) :											// if there : get AllComments from the local storage										
							$http.get("https://jsonplaceholder.typicode.com/comments").then(			// if not : get from the API
									function(response){
											$scope.AllComments =response.data;
											localStorageService.set('LastID',$scope.AllComments.length + 1);			// set LastID to last id from the comment from the API // to make IDs distinct
											localStorageService.set('AllComments', JSON.stringify($scope.AllComments));
											console.log("AllComments AfTERRRR "+$scope.AllComments);
											console.log("localstorage AfTERRRR "+localStorageService.get('AllComments'));
							}
						);
								
			$scope.search={				// initally set the search according ID 
				By : 'id'
			};
				
			
			$scope.addComment = function() {
				$scope.AllComments.push({							// push  the new comment data from the pop up to AllComments
					id : localStorageService.get('LastID'),			
					name: $scope.commentName,
					body: $scope.commentBody,
					email: $scope.commentEmail,
				});
				localStorageService.set('AllComments', JSON.stringify($scope.AllComments));		// update AllComments
				localStorageService.set('LastID',parseInt(localStorageService.get('LastID'))+1);		
			};
			
			$scope.removeComment = function(index) {
				$scope.searchByID(index);							
				$scope.AllComments.splice($scope.index, 1);			// delete the selected comment from AllComments
				localStorageService.set('AllComments', JSON.stringify($scope.AllComments));		// update AllComments
			};
			
			$scope.commentDialog = function(ev,index,state) {		// function related to pop up 
				
				if(state==='new'){									// change data of pop up acording to state (add new comment | edit selected comment)
					$scope.dialogTitle="Add A Comment";
					$scope.dialogNewState=true;
					$scope.dialogEditState=false;
					$scope.dialogBt="ADD COMMENT";
					$scope.commentName="";
					$scope.commentBody="";
					$scope.commentEmail=""; //clear the input after adding
				}
				else if(state==='edit'){
					$scope.dialogTitle="Edit A Comment";
					$scope.dialogNewState=false;
					$scope.dialogEditState=true;
					$scope.dialogBt="EDIT COMMENT";
					
					$scope.searchByID(index);
					console.log($scope.index);
					$scope.commentName=$scope.AllComments[$scope.index].name;			// fill the inputs in pop up with selected comments details
					$scope.commentBody=$scope.AllComments[$scope.index].body;
					$scope.commentEmail=$scope.AllComments[$scope.index].email;

				}
				
				$mdDialog.show(
				  {
					templateUrl: "AddCommentDialog.html",
					clickOutsideToClose: true,
					scope: $scope,
					preserveScope: true,
					controller : DialogController,
				});	
		    };
			
			$scope.editComment = function(index){
				$scope.AllComments[index].name = $scope.commentName;
				$scope.AllComments[index].body = $scope.commentBody;
				$scope.AllComments[index].email = $scope.commentEmail;
				localStorageService.set('AllComments', JSON.stringify($scope.AllComments));
			};


			$scope.searchByID = function(index){				// function used to know the index of the searched list from AllComments
				for (var i=0; i<$scope.AllComments.length;i++){
					console.log(i);
					if($scope.AllComments[i].id == index ){
						$scope.index = i;
					}
				}
			};
			
	});
	
	
function DialogController($scope,$rootScope, $mdDialog,localStorageService) {
    $scope.cancel = function() {
	$scope.commentName="";
	$scope.commentBody="";
	$scope.commentEmail=""; //clear the input before cancel                
      $mdDialog.cancel();
    };

    $scope.save = function() {
	  $scope.addComment();		
      $scope.cancel();
	  
    };
	$scope.edit = function() {
	  $scope.editComment($scope.index);		
      $scope.cancel();
	  
    };

  };
  
 app.filter('searchFor', function(){
	 
	return function(AllComments, search){

		if(!search.Text)						// if no text to search by : return AllComments
			return AllComments;

	 
		var result = [];						// else return the related comments

		search.Text = angular.lowercase(String(search.Text));
		
		angular.forEach(AllComments, function(comment){
					if(search.By == 'id'){			// if the search according ID
						if(angular.lowercase(String(comment.id)).indexOf(search.Text) !== -1){
							result.push(comment);
						}
					}
					else if(search.By == 'email')	// if the search according EMAIL
					{
						if(angular.lowercase(comment.email).indexOf(search.Text) !== -1){
							result.push(comment);
						}
					}
				
		});

		return result;
	};

});
})(Comments);
