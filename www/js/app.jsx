"use strict";

const baseURL = 'http://mwvotes.cov.bz/mobile/';
//const baseURL = "http://localhost/tonse/";




let deviceDetails = {};
$(document).ready(()=>{

    $(".phone-field").keyup(function(e){
        let sliced = $(this).val().slice(0,4);
        
        if(sliced != "+265" && sliced != "+255" && sliced != "+260"){
          $(this).val("+265");
        }
      });

 
  $(".phone-field").keydown(function(e){
            if($(this).val() == "+265"){
                var x=e.which||e.keycode;
                if(e.keyCode == 48){
                    try{
                        $.dialog({
                    title: '<span style="color:red;">Warning !</span>',
                    type: 'red',
                    content: "Remember not to include zero (0) to the phone number",
                });
                    }catch(e){
                        $.alert("Remember not to include zero (0) to the phone number");
                    }
                    e.preventDefault();
                }
            }else if((x>=48 && x<=57) || x==8 ||(x>=35 && x<=40)|| x==46){
                e.preventDefault();
            }
      });
});

function load(text){
    $("#loadingText").html(text);
    $('#loadingDimmer').dimmer({
        closeable:false
    }).dimmer('show');
    $("#body").click();
}
function stopLoad(){
    $("#body").click();
    $('#loadingDimmer').dimmer('hide');
}


function getIpAddress(){
    try{
        let ip_address = localStorage.getItem('ip_address');
        if(userdata != null){
            return ip_address
        }else{
            setIPAddress('http://mwvotes.cov.bz/mobile/');
            getIpAddress();
        }
    }catch(e){
        setIPAddress('http://mwvotes.cov.bz/mobile/');
        getIpAddress();
    }
};

function setIPAddress(ip_address){
    localStorage.setItem('ip_address',ip_address);
}
function getFormData(form){
	let form_data = $("#"+form).serializeArray();
	let json_obj = {};
	  $.each(form_data,
		function(i, v) {
			json_obj[v.name] = v.value;
	  });
	  return json_obj;
}
