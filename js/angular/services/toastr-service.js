'use strict';

(function () {
    angular.module('toastrServiceModule', [])
.factory('toastrService', function () {
        var functionToBeCalledOnShown;
        var functionsToBeCalledOnClick = [];
        
        function showToastr(type, content, timeOut, onToastrShown, onClick) {
            functionToBeCalledOnShown = onToastrShown;
            functionsToBeCalledOnClick.push(onClick);
            
            toastr.options = {
                timeOut: timeOut,
                preventDuplicates : false,
                onShown: onShown
            };
            
            switch (type) {                    
                case 'info':
                    toastr.info(content);
                    break;
                case 'success':
                    toastr.success(content);
                    break;
            }
        }
        
        function onShown() {
            if (typeof functionToBeCalledOnShown === "function") {
                functionToBeCalledOnShown($(this));
            }
            
            functionToBeCalledOnShown = undefined;
            $(this).attr('data-onClickIndex', functionsToBeCalledOnClick.length - 1);
            
            $(this).on('click', onToastrClick);
        }
        
        function onToastrClick(e) {
            var onClickFunctionIndex = $(this).attr('data-onClickIndex');
            
            if (onClickFunctionIndex && typeof functionsToBeCalledOnClick[onClickFunctionIndex] === 'function') {
                functionsToBeCalledOnClick[onClickFunctionIndex]($(this));
            }
        }
        
        return {
            showToastr: showToastr
        }
    })
})();