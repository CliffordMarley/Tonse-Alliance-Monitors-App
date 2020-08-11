let readonlyMode = 'Off';
"use strict";
let current_page = "setup_page";
let userdata;
let step = 1;
$(document).ready(()=>{

    $("#sideBarBtn").click(()=>{
        $('.ui.sidebar').sidebar('toggle');
    });
    $("#backButton").click(()=>{
        changeView('home', "Welcome");
        $("#staging p").html("READONLY MODE");
    });

    $("#switchStreamBtn").click(()=>{
        $("#fgape").click();
        $("#votes_view,#welcome_view").hide();
        $("#stream_view").show();
        $('.ui.sidebar').sidebar('toggle');
        $(".form-control").attr('disabled',false);
    });

    $("#logoutBtn").click(()=>{
        $('.ui.sidebar').sidebar('toggle');
        load("Encrypting Data...");
        setTimeout(()=>{
            load("Ending session...");
            setTimeout(()=>{
                load("Logging out securely...");
                setTimeout(()=>{
                    stopLoad();
                    window.location.reload();
                },1000);
            },1000);
        },1000);
    });

    $("#userGuideBtn").click(()=>{
        $('.ui.sidebar').sidebar('toggle');
        changeView('user_guide', "User Guide");
        $("#staging p").html("READONLY MODE");
    });

    $("#commentBtn").click(()=>{
        $('.ui.sidebar').sidebar('toggle');
        changeView('comment', "Observations");
        $("#staging p").html("READONLY MODE");
    });
    
    $("#BackToHomeBtn").click(()=>{
        changeView('home', "Welcome");
        $("#staging p").html("READONLY MODE");
    });

    $("#nextStepBtn").click(function(){

        if(validatePartGData()){
            swal("Data Integrity Alert!","Values exceeding 1000 cannot be allowed. Check your input!","warning");
        }else{
            if(step < 3){
                step++;
                $(".stepped_form").hide();
                $(`#v${step}`).show();
                $("#step_number").html(step);
                $("#tip_text span").html(stepMessages[step]);
            }
            if(step > 1){
                $("#prevStepBtn").show();
            }
    
            if(step >= 3){
                logErrors();
                if(data.flags.length > 0){
                    $("#error_btn").click();
                }
                $(this).hide();
            }
            if(step > 2){
                logErrors();
            }
        }
        
    });

    $("#prevStepBtn").click(function(){
        if(step > 1){
            step--;
            $(".stepped_form").hide();
            $(`#v${step}`).show();
            $("#step_number").html(step);
            $("#tip_text span").html(stepMessages[step]);
        }
        if(step < 3){
            $("#nextStepBtn").show();
        }

        if(step <= 1){
            $(this).hide();
        }
    });
});

let stepMessages = [
    'No Tip',
    'This is the number of ballot papers that were allocated and arrived at your polling station.',
    'This is the number of surplus ballot papers that were not initialy issued to voters.',
    'These are the ballot papers that were issued to voters but were not casted due to damage.',
    "This is the number of unacceptable votes that were improperly filled or weren't at all.",
    'Represents the total number of all candidate votes that were accepted and counted as normal/acceptable.',
    'This is the number of all ballot papers (Both Null & Void and Valid) that were casted into ballot boxes.',
    'Enter the number of valid votes that each candidate received on the voting station.',
    "<span style='color:red;'>Make sure you place your camera at a right angle and avoid movement while capturing the tally sheet image.</span>",
    'Comment about any issue worth noting that took place at your polling center.',
    'Do not worry if the data fails to transmit due to network failure. You can always reopen this file later and do so.'
    
];


async function changeView(_target,title){
    $(`.views`).hide();
    current_page = `#${_target}_page`;
    $(current_page).show();
    $("#staging p").html(title);
}

function initApp(){
    try{
        userdata = JSON.parse(localStorage.getItem('userdata'));
        if(userdata != null){
            $("#display_name").html(`${userdata.mname}`);
            $("#login_page").show();
            $("#v1").show();
           
        }else{
            $("#setup_page").show();
        }
    }catch(e){
        $("#setup_page").show();
    }
}

function checkStretchedFigures(callback){
    let received = $("#num_ballots").val();
    let unused = $("#unused_ballots").val();
    let cancelled = $("#cancelled_ballots").val();
    let null_and_void = $("#null_and_void_votes").val();
    let valid_votes = $("#valid_votes_cast").val();
    let total_cast = $("#total_ballots_cast").val();

    let cnd1 = $("#candidate_one").val();
    let cnd2 = $("#candidate_two").val();
    let cnd3 = $("#candidate_three").val();

    const field_list = [received,unused,cancelled,null_and_void,valid_votes,total_cast,cnd1,cnd2,cnd3];
    let test = false;

    for(let i = 0; i < field_list.length; i++){
        if(field_list[i] > 1000){
            test = true;
            break;
        }
    }
    return test;
}