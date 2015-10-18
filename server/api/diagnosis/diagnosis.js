'use strict';

function getCo2Range(comment1, deltaAb) {
  var range = [];
  if (comment1.indexOf('代酸') >= 0) {
    range.push(40 - 1.0 * deltaAb);
    range.push(40 - 1.4 * deltaAb);
  } else if (comment1.indexOf('代碱') >= 0) {
    range.push(40 + 0.4 * deltaAb);
    range.push(40 + 0.9 * deltaAb);
  } else {
    throw new Error('未知计算CO2代偿范围类型：' + comment1);
  }

  return range.sort()
}



function process(ph, paco2, beecf, sb, ab, na, cl) {
  var result = {
    debug:[],
    params: {}
  };
  var detalaPaco2 = paco2 - 40;
  var ab_sb = ab - sb;
  var ag = na - (cl + ab);
  var deltaAg = ag - 12;
  var rectifiedAb = ab + deltaAg;
  var deltaAb = ab - 24;

  result.params.ph = ph;
  result.params.paco2 = paco2;
  result.params.beecf = beecf;
  result.params.sb = sb;
  result.params.ab = ab;
  result.params.na = na;
  result.params.cl = cl;
  result.params.detalaPaco2 = detalaPaco2;
  result.params.ab_sb = ab - sb;
  result.params.ag = ag;
  result.params.detlaAb = deltaAb;
  result.params.rectifiedAb = rectifiedAb;

  function processStep5(ctx) {
    if (ph < 7.4) {
      if (ph >= 7.35) {
        ctx.debug.push('ph >= 7.35');
        ctx.comment5 = ctx.comment4 + '(ph正常)';
      } else {
        ctx.debug.push('ph < 7.35');
        ctx.comment5 = ctx.comment4 + '(酸血症)';
      }
    }
  }

  function processStep4(ctx) {
    if (ctx.step4type === '呼吸非关键因素') {
      ctx.debug.push('呼吸非关键因素，比较范围22~27');
      if (ab > 27) {
        ctx.debug.push('HCO3 > 27');
        ctx.comment4 = ctx.comment3 + '+正常AG代碱';
      } else if (22 <= ab && ab <= 27) {
        ctx.debug.push('22 <= HCO3 <= 27');
        ctx.comment4 = ctx.comment3;
      } else { // ab < 22
        ctx.debug.push('HCO3 < 22');
        ctx.comment4 = ctx.comment3 + '+正常AG代酸';
      }
    }
  }

  function processStep3(ctx) {
    if (ctx.comment1 === '代酸') {
      var co2Range = getCo2Range(ctx.comment1, deltaAb);
      ctx.co2Range = co2Range;
      if (ab > co2Range[1]) {
        ctx.debug.push('ab > co2 range H');
        ctx.comment3 = ctx.comment2 + '+呼酸';
      } else if (co2Range <= ab && ab <= co2Range[1]) {
        ctx.debug.push('ab in co2 range');
        ctx.comment3 = ctx.comment2;
      } else {
        ctx.debug.push('ab < co2 range L');
        ctx.comment3 = ctx.comment2 + '+呼碱';
      }
      ctx.step4type = '呼吸非关键因素';
    }
  }

  function processStep2(ctx) {
    if (ag > 16) {
      ctx.debug.push('ag > 16');
      ctx.comment2 = '高AG代酸';
      ctx.debug.push('rectify ab to ' + rectifiedAb);
      ab = rectifiedAb;
    } else if (8 <= ag && ag <= 16) {
      ctx.debug.push('8 <= ag <= 16');
      ctx.comment2 = '正常AG代酸';
    } else {
      ctx.debug.push('ag < 8');
      ctx.comment2 = '低AG代酸';
      ctx.debug.push('rectify ab to ' + rectifiedAb);
      ab = rectifiedAb;
    }
  }

  function processStep1(ctx) {
    if (ph < 7.4) {
      ctx.debug.push('ph < 7.4');
      if (paco2 < 40) {
        ctx.debug.push('paco2 < 40');
        if (beecf < -3) {
          ctx.debug.push('beecf < -3');
          if (sb < 22) {
            ctx.debug.push('sb < 22');
            if (ab < sb) {
              ctx.debug.push('ab < sb');
              ctx.comment1 = '代酸';
            }
          }
        }
      }
    }
  }

  processStep1(result);
  processStep2(result);
  processStep3(result);
  processStep4(result);
  processStep5(result);
  
  return result;
}

module.exports = function(req, res, next) {
  var params = {
    ph: +req.body.ph,
    paco2: +req.body.paco2,
    beecf: +req.body.beecf,
    sb: +req.body.sb,
    ab: +req.body.ab, // or named "hco3"
    na: +req.body.na,
    cl: +req.body.cl
  };
  
  var result = process(params.ph, params.paco2, params.beecf, params.sb, params.ab, params.na, params.cl);
  res.json(result);
};