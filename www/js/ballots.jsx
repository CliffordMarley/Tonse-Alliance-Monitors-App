"use strict";

let data;
let captured;
let stream_id;
let stream_index = 0;
$(document).ready(()=>{

    setTime();

    $("#error_btn").click(()=>{
        previewErrors();
    });

    $("#submitObservation").click(()=>{
        let observation = $("#monitor_observations").val();
        if(observation == null || observation == ""){
            swal("","Cannot sumbmit null content!","error");
            return;
        }
        const payload  = {
            'observation':observation,
            'user':userdata.mphone
        };
        load('Submitting observation....');
        $.post(`${baseURL}account/saveObservation.php?user=${payload.user}&content=${payload.observation}`,(response)=>{
            stopLoad();
            if(response == 'success'){
                $("#monitor_observations").val('');
                swal("",'Observations submitted succesfully!','success');
            }else{
                swal("",'Observations failed to submit!','error');
            }
        }).fail(()=>{
            stopLoad();
            swal("Connection Error!","Failed to submit observation. Check your internet connection!","error");
        });
    });

    $("#saveObservationButton").click(()=>{
        swal("Done!","Observations saved locally!",'success');
    });

    $("#saveDataButton1").click(()=>{
        savePartEData();
    });

    $("#saveDataButton2").click(()=>{
        savePartFData();
    });

    $("#saveDataButton3").click(()=>{
        savePartGData();
    });

    $("#saveBtn").click(()=>{
        savePartGData();
    });

    $("#captureTimeBtn").click(()=>{
        captureTime();
    });

    $("#captureTimeBtn2").click(()=>{
        captureTime2();
    });

    $("#transamitBtn").click(()=>{
        if(data.dump.status == "DONE"){
            swal("Action Denied!","Your data has already been transmitted. Contact Tally Center to grant you an override!","error");
            return;
        }
        if(data.dump.tally_sheet == null || data.dump.tally_sheet == ""){
            swal("","You are required to capture the tally sheet image before transmitting.","warning");
            return;
        }
  
        $.ajax({
            url:`${baseURL}account/getvotes`,
            method:"POST",
            contentType:"application/x-www-form-urlencoded; charset=utf-8",
            dataType:"json",
            data:{'payload': JSON.stringify(data)},
            beforeSend:()=>{
                load("Transmitting data to server...");
            },success:(response)=>{
                stopLoad();
                swal("", response.message, response.status);
                if(response.status == "success"){
                    data.dump.status = "DONE";
                    saveCaptured();
                    $(".form-control").attr('readonly',true);
                    $("#transamitBtn,#saveBtn").attr('disabled',true);
                }
            },error:(e)=>{
                stopLoad();
                swal("Connection Error!", "Check your internet connectivity!","error");
            }
        });
    });


    $("#null_and_void_votes_pg").keyup(function(){
        data.dump.form_6a_pg.null_and_void_votes_pg = this.value;
        saveCaptured();
    });

    $("#valid_votes_cast_pg").keyup(function(){
 
        data.dump.form_6a_pg.valid_votes_cast_pg = this.value;
        saveCaptured();
    });

    $("#total_votes_cast_pg").keyup(function(){

        data.dump.form_6a_pg.total_votes_cast_pg = this.value;
        saveCaptured();
    });

 

    $("#candidate_one").keyup(function(){
        data.dump.form_6a_pg.candidate_one = this.value;
        saveCaptured();
    });

    $("#candidate_two").keyup(function(){
        data.dump.form_6a_pg.candidate_two = this.value;
        saveCaptured();
    });

    $("#candidate_three").keyup(function(){
        data.dump.form_6a_pg.candidate_three = this.value;
        saveCaptured();
    });

    $("#captureImageBtn").click(()=>{
        navigator.camera.getPicture(onSuccess,onFail,{
            quality:50,
            allowEdit:true,
            sourceType: Camera.PictureSourceType.CAMERA,
            destinationType:Camera.DestinationType.DATA_URL
        });
    });

    // LAST CALL INIT
    initApp();
});


function onSuccess(Image){
    data.dump.tally_sheet = Image;
    saveCaptured();
   try{
    var image = document.getElementById('tally_sheet_image');
    image.src = "data:image/jpeg;base64," + Image;
   }catch(e){
    var image = document.getElementById('tally_sheet_image');
    image.src = "data:image/jpeg;base64," + Image;
   }
}

function onFail(err){
    swal('','Failed to pick up image!','error');
}



function preLoadData(stream){
    data = stream;
    getPartEData(data.dump.form_6a_pe);
    getPartFData(data.dump.form_6a_pf);
    getPartGData(data.dump.form_6a_pg);
    if(data == null && !data){
        localStorage.clear();
        swal("","Application Error!",'error');
        setTimeout(()=>{
            window.location.reload();
        },2000);
    }else{
        $("#stream_view").hide();
        $("#center_name").html(userdata.RcName);
        if(data.dump.time.opening == '' || data.dump.time.opening == null){
            $("#welcome_view").show();
        }else{
            $("#votes_view").show();
        }

        if(data.dump.time.closing == '' || data.dump.time.closing == null){
            $("#fgapf,#fgapg").hide();
        }else{
            $("#fgapf,#fgapg").show();
        }
        if(data.dump.status == "DONE"){
            readonlyMode = "On";
            $(".form-control").attr('disabled',true);
            $("#saveBtn,#transamitBtn").attr('disabled',true);
            $("#staging").css('background-color','rgba(255,0,0,.7)');
            $("#staging p").html("READONLY MODE");
        }else{
            $("#saveBtn,#transamitBtn").attr('disabled',false);
            $("#staging p").html("Forms");
            $("#staging").css('background-color','rgba(0,0,0,.7)');
            readonlyMode = 'Off';
        }
        try{
            if(data.dump.tally_sheet != '' && data.dump.tally_sheet != null){
                var image = document.getElementById('tally_sheet_image');
                image.src = "data:image/jpeg;base64," + data.dump.tally_sheet;
            }
        }catch(e){
            console.log("Failed to load tallysheet image.");
        }finally{
           console.log('All data preloaded.');
        }
    }
}


function previewErrors(){
    let DOM = "";
    for(let i = 0; i < data.flags.length; i++){
        DOM += `<li>${data.flags[i]}</li>`;
    }

    $("#errors_list").html(DOM);
}

function captureTime(){

    let time = `${$("#time_hour").val()}:${$("#time_minute").val()} ${$("#clock").val()}`;
    data.dump.time.opening = time;
    captured[stream_index] = data;
    saveCaptured();
   
    $("#welcome_view").hide();
    $("#votes_view").show();
}

function captureTime2(){

    let time = `${$("#time_hour2").val()}:${$("#time_minute2").val()} ${$("#clock2").val()}`;
    data.dump.time.closing = time;
    captured[stream_index] = data;
    saveCaptured();
    swal('Done!','Form 6A Part E Data successfully saved!','success');

    $("#fgapf,#fgapg").show();
    $("#fgapf,#dimissPCCT").click();
}

function setTime(){
    let DOM = "";
    for (let index = 1; index <= 12; index++) {
       if(index < 10){
        DOM += `<option value='0${index}'>0${index}</option>`;
       }else{
        DOM += `<option value='${index}'>${index}</option>`;
       }
    }
    $("#time_hour").html(DOM);
    $("#time_hour2").html(DOM);

    DOM = "";
    for (let index = 0; index <= 60; index++) {
        if(index < 10){
            DOM += `<option value='0${index}'>0${index}</option>`;
           }else{
            DOM += `<option value='${index}'>${index}</option>`;
        }
    }
    $("#time_minute").html(DOM);
    $("#time_minute2").html(DOM);
}

function savePartEData(){
    const FORM_6A_PE = getFormData('part_e_form');
    data.dump.form_6a_pe = FORM_6A_PE;
    console.log(FORM_6A_PE);

    if(validatePartEData()){
        swal("Data Integrity Alert!","Field values cannot exceed 1000!","warning");
        return;
    }else{
        if(checkEmpty(FORM_6A_PE)){
            swal("Attention!","You need to complete all form fields before saving!","warning");
        }else{
            if(FORM_6A_PE.to_be_accounted_for_pe > 0){
                if(data.dump.time.closing == null || data.dump.time.closing == ""){
                    $("#laucnCloseTimeModal").click();
                }else{
                    $("#fgapf").click();
                    swal("Success!","Data saved successfully!","success");
                    saveCaptured();
                }
            }else{
                swal("Attention!","Total number of ballot papers to be accounted for cannot be less than or equal to zero (0)","warning");
            }
        }
    }

    
}

function savePartFData(){
    const FORM_6A_PF = getFormData('part_f_form');
    data.dump.form_6a_pf = FORM_6A_PF;
    console.log(FORM_6A_PF);

    if(data.dump.time.closing == null || data.dump.time.closing == ""){
        $("#laucnCloseTimeModal").click();
    }
   
    if(validatePartFData()){
        swal("Data Integrity Alert!","Field values cannot exceed 1000!","warning");
        return;
    }else{
        saveCaptured();
        swal('Done!','Form 6A Part F Data successfully saved locally!','success');
        $("#fgapg").click();
    }
}


function savePartGData(){
    const FORM_6A_PG = getFormData('part_g_form');
    data.dump.form_6a_pg = FORM_6A_PG;
   
    console.log(FORM_6A_PG);

    if(data.dump.time.closing == null || data.dump.time.closing == ""){
        $("#laucnCloseTimeModal").click();
    }
    if(validatePartGData()){
        swal("ALert!","Values exceeding 1000 are not allowed!","warning");  
    }else{
        saveCaptured();
        swal('Done!','Form 6A Part G Data successfully saved locally!','success');
    }
    let comparable = validatePartsData(FORM_6A_PG);

}

function validatePartGData(){
   
    let received = $("#num_ballots").val();
    let unused = $("#unused_ballots").val();
    let cancelled = $("#cancelled_ballots").val();
    let null_and_void = $("#null_and_void_votes").val();
    let valid_votes = $("#valid_votes_cast").val();
    let total_cast = $("#total_ballots_cast").val();

    let cnd1 = $("#candidate_one").val();
    let cnd2 = $("#candidate_two").val();
    let cnd3 = $("#candidate_three").val();

    let values = [received,unused,cancelled,null_and_void,valid_votes,total_cast,cnd1,cnd2,cnd3];
    let test = false;
    for(let i = 0; i < values.length; i++){
        if(values[i] > 1000){
            test = true;
            break;
        }
    }
    return test;

}

function validatePartsData(data){
    data = JSON.stringify(data,(key,value)=>{
        if(value === "" || value === '' || value === null){
            return 0;
        }else{
            return value;
        }
    });

    data = JSON.parse(data);
    return data;
}

function checkDisallowedFigures(json, value) {
    for (let key in json) {
        if (typeof (json[key]) === "object") {
            return checkDisallowedFigures(json[key], value);
        } else if (json[key] > value) {
            return true;
        }
    }
    return false;
}

function checkEmpty(json) {
    for (let key in json) {
        if (typeof (json[key]) === "object") {
            return checkEmpty(json[key]);
        } else if (json[key] == '' || json[key] == null) {
            return true;
        }
    }
    return false;
}

function openStream(sid){
    stream_id = sid;
   captured = JSON.parse(localStorage.getItem('captured'));
    var stream_data;
    for(let i = 0 ; i < captured.length; i++){
        if(stream_id == captured[i].stream){
            stream_index = i;
            stream_data = captured[i];
            break;
        } 
    }
    console.log(stream_data);
    preLoadData(stream_data);
}

function saveCaptured(){
    localStorage.setItem('captured',JSON.stringify(captured));
}

function getPartGData(fd){
    $("#null_and_void_votes_pg").val(fd.null_and_void_votes_pg);
    $("#valid_votes_cast_pg").val(fd.valid_votes_cast_pg);
    $("#total_votes_cast_pg").val(fd.total_votes_cast_pg);
    $("#candidate_one").val(fd.candidate_one);
    $("#candidate_two").val(fd.candidate_two);
    $("#candidate_three").val(fd.candidate_three);
}

function getPartEData(fd){
    $("#received_ballots_pe").val(fd.received_ballots_pe);
    $("#chek_count_adjustments_pe").val(fd.chek_count_adjustments_pe);
    $("#actual_ballots_received_pe").val(fd.actual_ballots_received_pe);
    $("#extra_ballots_received_pe").val(fd.extra_ballots_received_pe);
    $("#less_ballots_dispatched_pe").val(fd.less_ballots_dispatched_pe);
    $("#to_be_accounted_for_pe").val(fd.to_be_accounted_for_pe);
}

function validatePartEData(){
    const values = [];
    let received_ballots_pe = $("#received_ballots_pe").val();
    let chek_count_adjustments_pe = $("#chek_count_adjustments_pe").val();
    let actual_ballots_received_pe = $("#actual_ballots_received_pe").val();
    let extra_ballots_received_pe = $("#extra_ballots_received_pe").val();
    let less_ballots_dispatched_pe = $("#less_ballots_dispatched_pe").val();
    let to_be_accounted_for_pe = $("#to_be_accounted_for_pe").val();

    values.push(received_ballots_pe);
    values.push(chek_count_adjustments_pe);
    values.push(actual_ballots_received_pe);
    values.push(extra_ballots_received_pe);
    values.push(less_ballots_dispatched_pe);
    values.push(to_be_accounted_for_pe);

    let test = false;

    for(let i = 0; i < values.length; i++){
        if(values[i] > 1000){
            test = true;
            break;
        }
    }
    return test;
}

function getPartFData(fd){
    $("#ballots_to_be_accounted_pf").val(fd.ballots_to_be_accounted_pf);
    $("#cancelled_ballots_pf").val(fd.cancelled_ballots_pf);
    $("#certified_voters_register_pf").val(fd.certified_voters_register_pf);
    $("#difference_pf").val(fd.difference_pf);
    $("#registered_voters_pf").val(fd.registered_voters_pf);
    $("#spoilt_ballots_pf").val(fd.spoilt_ballots_pf);
    $("#total_1_pf").val(fd.total_1_pf);
    $("#total_2_pf").val(fd.total_2_pf);
    $("#total_ballots_cast_pf").val(fd.total_ballots_cast_pf);
    $("#unused_ballots_pf").val(fd.unused_ballots_pf);
    $("#voters_to_vote_elsewhere_pf").val(fd.voters_to_vote_elsewhere_pf);
    
}

function validatePartFData(){
    
  
    let ballots_to_be_accounted_pf = $("#ballots_to_be_accounted_pf").val();
    let cancelled_ballots_pf = $("#cancelled_ballots_pf").val();
    let certified_voters_register_pf = $("#certified_voters_register_pf").val();
    let difference_pf = $("#difference_pf").val();
    let registered_voters_pf = $("#registered_voters_pf").val();
    let spoilt_ballots_pf = $("#spoilt_ballots_pf").val();
    let total_1_pf = $("#total_1_pf").val();
    let total_2_pf = $("#total_2_pf").val();
    let total_ballots_cast_pf = $("#total_ballots_cast_pf").val();
    let unused_ballots_pf = $("#unused_ballots_pf").val();
    let voters_to_vote_elsewhere_pf = $("#voters_to_vote_elsewhere_pf").val();

    const values = [ballots_to_be_accounted_pf,cancelled_ballots_pf,certified_voters_register_pf,difference_pf,registered_voters_pf,spoilt_ballots_pf,total_1_pf,total_1_pf,total_2_pf,total_ballots_cast_pf,unused_ballots_pf,voters_to_vote_elsewhere_pf];


    let test = false;

    for(let i = 0; i < values.length; i++){
        if(values[i] > 1000){
            test = true;
            break;
        }
    }
    return test;
}