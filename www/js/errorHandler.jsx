"use strict";



function logErrors(){
    let error = [];
    let pe = data.dump.form_6a_pe;
    let pf = data.dump.form_6a_pf;
    let pg = data.dump.form_6a_pg;

    if((pe.received_ballots_pe + (pe.chek_count_adjustments_pe)) != pe.actual_ballots_received_pe){
        error.push('The number of actual ballot papers received from CRO is not equal to the sum of received ballots and the adjustment after check count.');
    }
    if(pe.actual_ballots_received_pe + pe.extra_ballots_received_pe - pe.less_ballots_dispatched_pe != pe.to_be_accounted_for_pe){
        error.push('Your entries of Form-6A-PE (fields 2, 3 & 4) does not sum up to the number of ballot papers to be accounted for.');
    }

    if(pf.voters_to_vote_elsewhere_pf+pf.certified_voters_register_pf+pf.unused_ballots_pf+pf.spoilt_ballots_pf+pf.cancelled_ballots_pf > pe.actual_ballots_received_pe){
        error.push("The sum of Form-6A-PF in fields 2, 3, 4, 5 & 6 is greater than the actual number of ballots received from CRO after check count on Form-6A-PE.");
    }

    if(pf.total_ballots_cast_pf > pf.voters_to_vote_elsewhere_pf+pf.certified_voters_register_pf){
        error.push("Number of ballot papers cast cannot is greater than the sum of voters authorised to vote from and the number of votes marked on the certified voters' register as voted.");
    }

    if(pf.total_1 !== (pf.unused_ballots_pf+pf.cancelled_ballots_pf+pf.spoilt_ballots_pf)){
        error.push("The recorded total in Form-6A-PE in field 7 is not equal to the sum Form-6A-PE fields 4,5 & 6");
    }

    if(pf.total_ballots_cast_pf != (pg.candidate_one+pg.candidate_two+pg.candidate_three+pg.null_and_void_votes_pg) || pf.total_ballots_cast_pf != pg.total_votes_cast_pg){
        error.push("The recorded ballot papers  on Form-6A-PF in field 8, is not equal the total votes cast on Form-6A-PG field (f) of ");
    }

    if(pf.total_2_pf > pf.total_ballots_cast_pf+pf.total_1){
        error.push("The sum of cast, unused, spoiled and cancelled ballot papers is more than actual ballot papers received!");
    }

    if(pf.ballots_to_be_accounted_pf != pe.to_be_accounted_for_pe){
        error.push("The number of ballot papers to be accounted for on Form-6A-PF (field 10) is different from the ballot papers to be accounted for on Form-6A-PE (field 5).");
    }

    if(pf.difference_pf != pf.total_2_pf - pf.ballots_to_be_accounted_pf){
        error.push("The difference on Form-6A-PF (field 11) is not equalto the sum of fields 9 & 10.");
    }

    if(pg.valid_votes_cast_pg != (pg.candidate_one+pg.candidate_two+pg.candidate_three)){
        error.push("The recorded number of valid votes cast is not equal to the sum of candidate scores.");
    }

    if(pg.total_votes_cast_pg != (pg.candidate_one+pg.candidate_two+pg.candidate_three+pg.null_and_void_votes_pg)){
        error.push("The recorded value of total votes cast is not equal to the sum of candidate scores and numm & void votes.");
    }

    console.log(error);

    data.flags = error;
    saveCaptured();
}
