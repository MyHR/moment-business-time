var moment = require('./business-hours');
var localeData = require('../locale/myhr-auckland');
var _ = require('lodash');

module.exports = function(holidays) {
  var holidayDates = _.map(_.filter(holidays, {'isNational': true}), function(holiday) {
    return moment.utc(holiday.date).addPacificAucklandUTCOffsetToDate().format('YYYY-MM-DD');
  });
  return holidayDates;
}