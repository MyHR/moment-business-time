var moment = require('./business-hours');
var nationalHolidays = require('./national-holidays');
var localeData = require('../locale/myhr-auckland');

module.exports = function(requestCreatedDate, slaDays, holidays) {
  // set the locale data to have MyHR Auckland's working hours
  moment.updateLocale('en', localeData);
  moment.updateLocale('en', {
    holidays: nationalHolidays(holidays)
  });
  // add the UTC offset for Pacific/Auckland time to get a value we can compare easily to the
  // locale data for MyHR's working hours, which is easy to understand and takes into
  // consideration DST changes.
  var requestTime = moment(requestCreatedDate).addPacificAucklandUTCOffsetToDate();
  var nextWorkingTimeStart;
  var dueDay;
  var dueTime;

  // If a request is made DURING business hours, it is due two working days ahead at the same time of day it was requested
  if (requestTime.isWorkingTime()) {
    dueTime = requestTime.clone().addWorkingTime(slaDays, 'days');
  }
  // If a request is made OUTSIDE of business hours, it is due at 5pm on the second working day after the request was made.
  else {
    nextWorkingTimeStart = requestTime.clone().nextWorkingTime();
    dueDay = nextWorkingTimeStart.clone().addWorkingTime(slaDays - 1, 'days');
    dueTime = dueDay.clone().endOfWorkingDay();
  }
  // now remove the offset minutes we added to get back to UTC time
  return dueTime.removePacificAucklandUTCOffsetFromDate();
}