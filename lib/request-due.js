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

  if (requestTime.isWorkingTime()) {
    dueDay = requestTime.clone().addWorkingTime(slaDays, 'days');
    dueTime = dueDay.clone().endOfWorkingDay();
  }
  else {
    nextWorkingTimeStart = requestTime.clone().nextWorkingTime();
    dueDay = nextWorkingTimeStart.clone().addWorkingTime(slaDays - 1, 'days');
    dueTime = dueDay.clone().endOfWorkingDay();
  }
  // now remove the offset minutes we added to get back to UTC time
  return dueTime.removePacificAucklandUTCOffsetFromDate();
}