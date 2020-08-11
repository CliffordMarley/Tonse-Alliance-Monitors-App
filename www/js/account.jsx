
"use strict";

$(document).ready(()=>{
    $("#setupAccBtn").click(()=>{
        setupAccount();
    });

    $("#verifyCodeBtn").click(()=>{
        verifyAccount();
    });

    $("#loginBtn").click(()=>{
        login(res => {
            if(res == "done"){
                stopLoad();
            }
        });
    });

    $("#switchAccountBtn").click(()=>{
        switchAccounts();
    });
});

function setupAccount(){
    let payload = {
        'phone_number':$("#phone_number").val(),
        'origin': 'Mobile'
    };

    if(payload.phone_number == null || payload.phone_number == ""){
        swal("Attention!","Please enter your registered phone number.",'error');
        return;
    }
    if(payload.phone_number.length != 13){
        swal("Attention!","Invalid phone number length.",'error');
        return;
    }

    $.ajax({
        url:`${baseURL}account/setup`,
        method:"POST",
        contentType:"application/x-www-form-urlencoded",
        dataType:"json",
        data:payload,
        beforeSend:()=>{
            load("Setting up your account...");
        },
        success:(response)=>{
            stopLoad();
            if(response.status == "success"){
                $("#phone_display").html(payload.phone_number);
                //changeView('verification','Verify phone number');
                window.userdata = response.data;
                
                var streams = [];
                for(var i = 0; i < window.userdata.monitors.length; i++){
                    streams.push({
                       'stream':window.userdata.monitors[i].stream,
                       'center_name':window.userdata.monitors[i].RcName,
                       'username':window.userdata.monitors[i].uphone,
                       'uid':window.userdata.monitors[i].uid,
                       'pollstation':window.userdata.monitors[i].pollingstation,
                       'dump': {
                                'status':'',
                                'comment':'',
                                'flags':'',
                                'tally_sheet':'',
                                'time':{
                                    'opening':'',
                                    'closing':''
                                },
                                'form_6a_pe':'',
                                'form_6a_pf':'',
                                'form_6a_pg':{
                                    'candidate_one':'',
                                    'candidate_two':'',
                                    'candidate_three':'',
                                    'num_and_void':'',
                                    'valid_votes_cast':'',
                                    'total_votes_cast':''
                                }
                            }
                        }
                        );
                        console.log(streams);
                    }
                localStorage.setItem('userdata',JSON.stringify(window.userdata));
                localStorage.setItem('captured',JSON.stringify(streams));
                window.location.reload();
            }else{
                swal("",response.message,response.status);
            }
        },error:(e)=>{
            stopLoad();
            swal("Connection Error!", "Poor network connectivity detected.","error");
        }
    });
}

function verifyAccount(){
    const payload = {
        'phone_number':$("#phone_number").val(),
        'code':$("#verification_code").val()
    };

    if(payload.code == null || payload.code == ""){
        swal("Attention!","Please enter the code sent to you via SMS",'error');
        return;
    }

    $.ajax({
        url:`${baseURL}account/verify`,
        method:"POST",
        contentType:"application/x-www-form-urlencoded",
        dataType:"json",
        data:payload,
        beforeSend:()=>{
            load("Verifying account...");
        },
        success:(response)=>{
            stopLoad();
            if(response.status == "success"){
               localStorage.setItem('userdata',JSON.stringify(window.userdata));
               window.location.reload();
               
            }else{
                swal("",response.message,response.status);
            }
        },error:(e)=>{
            stopLoad();
            swal("Connection Error!", "Poor network connectivity detected.","error");
        }
    });
}


function login(callback){

    load("Authenticating...");

    const payload = {
        'phone_number':userdata.phone_number,
        'pin':$("#password").val()
    };

    if(payload.pin == userdata.upass){
        $("#monitor_name").html(userdata.mname);
        $("#ipConfig").hide();
        changeView('home','Streams');
        $("#sideBarBtn").show();
        loadStreamList();
        stopLoad();
    }else{
        swal("Access Denied!","Wrong PIN entered. Try again.", "error");
        stopLoad();
    }

    callback("done");
}

function switchAccounts(){
    swal({
        title: "Attention!",
        text: "By switching accounts, you're also clearing phone saved data of this account. Note that transmitted data will not be affected!",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        confirmButtonText:"Confirm!",
        showLoaderOnConfirm: true
      }, function (data) {
          if(data){
              localStorage.clear();
              window.location.reload();
          }
      });
}

function loadStreamList(){
    let DOM = "";
    for (let index = 0; index < userdata.monitors.length; index++) {
        DOM += `<div class="col-8 mx-auto" >
                <button onclick="openStream(${userdata.monitors[index].stream})" type="button" class="btn btn-success my-3 btn-lg btn-block" style="border-radius:0;">
                    STREAM ${userdata.monitors[index].stream}
                </button>
            </div>`;
       
    }
    $("#streams_list").html(DOM);
}