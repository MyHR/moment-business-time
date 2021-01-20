var moment = require('./business-hours');
var nationalHolidays = require('./national-holidays');
var localeData = require('../locale/myhr-auckland');

module.exports = function(requestCreatedDate, sla, holidays) {
  // set the locale data to have MyHR Auckland's working hours
  moment.updateLocale('en', localeData);
  moment.updateLocale('en', {
    holidays: nationalHolidays(holidays)
  });
  // add the UTC offset for Pacific/Auckland time to get a value we can compare easily to the
  // locale data for MyHR's working hours, which is easy to understand and takes into
  // consideration DST changes.
  var requestTime = moment(requestCreatedDate).addPacificAucklandUTCOffsetToDate();
  var timeRightNow = moment().addPacificAucklandUTCOffsetToDate();
  var nextWorkingTimeStart;
  var dueDay;
  var dueTime;

  var parts = sla.split(' ');
  var slaUnit = 'days';
  var slaNumber = parseInt(parts[0]);
  if (parts.length > 1) {
    slaUnit = parts[1];
  }

  if (slaUnit === 'days') {
    // If a request is made DURING business hours, it is due two working days ahead at the same time of day it was requested
    if (requestTime.isWorkingTime()) {
      dueTime = requestTime.clone().addWorkingTime(slaNumber, slaUnit);
    }
    // If a request is made OUTSIDE of business hours, it is due at 5pm on the second working day after the request was made.
    else {
      nextWorkingTimeStart = requestTime.clone().nextWorkingTime();
      dueDay = nextWorkingTimeStart.clone().addWorkingTime(slaNumber - 1, slaUnit);
      dueTime = dueDay.clone().endOfWorkingDay();
    }
  }
  else if (slaUnit === 'hours') {
    dueTime = timeRightNow.clone().addWorkingTime(slaNumber, slaUnit);
  }
  
  // now remove the offset minutes we added to get back to UTC time
  return dueTime.removePacificAucklandUTCOffsetFromDate();
}