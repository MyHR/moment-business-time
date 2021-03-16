var moment = require('../lib/business-hours');
var nationalHolidays = require('../lib/national-holidays');
var requestDue = require('../lib/request-due');

var localeData = require('../locale/default');
var myHRAucklandLocaleData = require('../locale/myhr-auckland');
var holidays = require('../test-data/holidays');

describe('moment.business-hours request SLA calculations', function () {

    var now = '2018-05-15T00:30:20',
        weekend = '2018-05-19T10:13:00';

    var createdAt = '2018-05-15T00:30:20';

    var date = 'YYYY-MM-DD',
        time = 'HH:mm:ss.SSS',
        full = date + ' ' + time;

    var requestSlaLocale = myHRAucklandLocaleData;

    beforeEach(function () {
        moment.locale('en');
    });

    afterEach(function () {
        moment.updateLocale('en', localeData);
    });

    describe('isWorkingTime using Pacific/Auckland workingHours in locale', function() {

        it('should let me convert a UTC createdAt date to the Pacific/Auckland timezone', function() {
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.isWorkingTime().should.be.true;
        });

        it('should report a Pacific/Auckland time that is 8am on a Monday as not being working time', function() {
            createdAt = '2018-05-13T20:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.isWorkingTime().should.be.false;
        });

        it('should report a Pacific/Auckland time that is 9am on a Monday as being working time', function() {
            createdAt = '2018-05-13T21:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.isWorkingTime().should.be.true;          
        });

        it('should report a Pacific/Auckland time that is 4:59pm on a Monday as being working time', function() {
            createdAt = '2018-05-14T04:59:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.isWorkingTime().should.be.true;          
        });

        it('should report a Pacific/Auckland time that is 5pm on a Monday as not being working time', function() {
            createdAt = '2018-05-14T05:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.isWorkingTime().should.be.false;          
        });

    });

    describe('nextWorkingTime using Pacific/Auckland workingHours in locale', function() {

        it('nextWorkingTime for 7am on a Monday in Pacific/Auckland time should be 9am on that Monday', function() {
            createdAt = '2018-05-13T19:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.nextWorkingTime().format(full).should.equal('2018-05-14 09:00:00.000');
        });
        
        it('nextWorkingTime for 9am on a Monday in Pacific/Auckland time should be 9am on that Monday', function() {
            createdAt = '2018-05-13T21:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.nextWorkingTime().format(full).should.equal('2018-05-14 09:00:00.000');
        });
        
        it('nextWorkingTime for 6pm on a Thursday in Pacific/Auckland time should be 9am on the Friday', function() {
            createdAt = '2018-05-17T06:00:00'; // UTC Thursday morning is Thursday night for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.nextWorkingTime().format(full).should.equal('2018-05-18 09:00:00.000');
        });
        
        it('nextWorkingTime for 6pm on a Friday in Pacific/Auckland time should be 9am on the following Monday', function() {
            createdAt = '2018-05-18T06:00:00'; // UTC Friday morning is Friday night for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.nextWorkingTime().format(full).should.equal('2018-05-21 09:00:00.000');
        });

    });

    describe('addWorkingTime using Pacific/Auckland workingHours in locale', function() {

        it('add two working days for 8am on a Monday in Pacific/Auckland time should give 8am on Wednesday', function() {
            createdAt = '2018-05-13T20:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(2, 'days').format(full).should.equal('2018-05-16 08:00:00.000');
        });

        it('add 1 working day for 8am on a Thursday in Pacific/Auckland time should give 8am on the Friday', function() {
            createdAt = '2018-05-16T20:00:00'; // UTC Wednesday night is Thursday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(1, 'days').format(full).should.equal('2018-05-18 08:00:00.000');
        });

        it('add 2 working days for 8am on a Thursday in Pacific/Auckland time should give 8am on the following Monday', function() {
            createdAt = '2018-05-16T20:00:00'; // UTC Wednesday night is Thursday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(2, 'days').format(full).should.equal('2018-05-21 08:00:00.000');
        });

        it('add 2 working days for 8am on a Friday in Pacific/Auckland time should give 8am on the following Tuesday', function() {
            createdAt = '2018-05-17T20:00:00'; // UTC Thursday night is Friday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(2, 'days').format(full).should.equal('2018-05-22 08:00:00.000');
        });
    });

    describe('endOfWorkingDay using Pacific/Auckland workingHours in locale', function() {

        it('endOfWorkingDay for a non-working day should return null', function() {
            createdAt = '2018-05-12T17:00:00'; // UTC Saturday night is Sunday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            expect(pacificAucklandCreatedAtWithoutOffset.endOfWorkingDay()).to.be.null;
        });
        
        it('endOfWorkingDay for 8am on a Monday in Pacific/Auckland time should be 5pm on that Monday', function() {
            createdAt = '2018-05-13T20:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.endOfWorkingDay().format(full).should.equal('2018-05-14 17:00:00.000');
        });
        
        it('endOfWorkingDay for 6pm on a Thursday in Pacific/Auckland time should be 5pm on that Thursday', function() {
            createdAt = '2018-05-17T06:00:00'; // UTC Thursday morning is Thursday night for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.endOfWorkingDay().format(full).should.equal('2018-05-17 17:00:00.000');
        });
        
        it('endOfWorkingDay for 3pm on a Friday in Pacific/Auckland time should be 5pm on that Friday', function() {
            createdAt = '2018-05-18T03:00:00'; // UTC Friday morning is Friday night for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.endOfWorkingDay().format(full).should.equal('2018-05-18 17:00:00.000');
        });

    });

    describe('holidays', function () {

        beforeEach(function () {
            moment.locale('en');
            moment.updateLocale('en', requestSlaLocale);
            moment.updateLocale('en', {
                holidays: nationalHolidays(holidays)
            });
        });

        afterEach(function () {
            moment.updateLocale('en', {
                holidays: []
            });
        });

        it('does not count national holidays as working days', function () {
            moment('2018-02-06').isWorkingDay().should.be.false;
        });

        it('does count regional holidays as working days', function () {
            moment('2018-01-29').isWorkingDay().should.be.true;
        });

        it('does not include holidays when adding working time', function () {
            createdAt = '2017-12-30T18:00:00'; // 7am on NYE for Pacific/Auckland, next two days are national public holidays
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(1, 'days').format(full).should.equal('2018-01-03 07:00:00.000');
        });

    });

    // @TODO These tests don't work when the createdAt date I am working with is in NZST and I am running the tests during NZDT
    //       due to the statis nature of the addPacificAucklandUTCOffsetToDate and 
    describe('requestDue in 2 days using Pacific/Auckland workingHours in locale', function() {
        
        var sla = '2 days';

        it('requestDue for a request made at 7am on a Monday should be 5pm on the Tuesday', function() {
            createdAt = '2018-05-13T19:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-15 05:00:00.000');
        });

        it('requestDue for a request made at one second before 9am on a Monday should be 5pm on the Tuesday because it was requested outside business hours', function() {
            createdAt = '2018-05-13T20:59:59'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-15 05:00:00.000');
        });

        it('requestDue for a request made at 9am on a Monday should be 9am on the Wednesday because it was requested within business hours', function() {
            createdAt = '2018-05-13T21:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-15 21:00:00.000');
        });

        it('requestDue for a request made at 12pm on a Monday should be 12pm on the Wednesday', function() {
            createdAt = '2018-05-14T00:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-16 00:00:00.000');
        });

        it('requestDue for a request made at 9pm on a Monday should be 5pm on the Wednesday', function() {
            createdAt = '2018-05-14T09:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-16 05:00:00.000');
        });

        it('requestDue for a request made at 9pm on a Wednesday should be 5pm on the Friday', function() {
            createdAt = '2018-05-16T09:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-18 05:00:00.000');
        });

        it('requestDue for a request made at 8am on a Thursday should be 5pm on the Friday', function() {
            createdAt = '2018-05-16T20:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-18 05:00:00.000');
        });

        it('requestDue for a request made at 9am on a Thursday should be 9am on the following Monday', function() {
            createdAt = '2018-05-16T21:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-20 21:00:00.000');
        });

        it('requestDue for a request made at 9am on NYE (a Sunday) should be 5pm on Thursday 4th January', function() {
            createdAt = '2017-12-30T20:00:00'; //UTC time so equivalent to 2017-12-31 09:00 in Pacific/Auckland time
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-01-04 04:00:00.000');
        });
    });

    describe('requestDue in 4 working hours using Pacific/Auckland workingHours in locale', function() {
        
        var sla = '4 hours';

        it('requestDue for a request made at 7am on a Monday should be 1pm on the Monday', function() {
            createdAt = '2018-05-13T19:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-14 01:00:00.000');
        });

        it('requestDue for a request made at one second before 9am on a Monday should be 1pm on the Monday', function() {
            createdAt = '2018-05-13T20:59:59'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-14 01:00:00.000');
        });

        it('requestDue for a request made at 9am on a Monday should be 1pm on the Monday', function() {
            createdAt = '2018-05-13T21:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-14 01:00:00.000');
        });

        it('requestDue for a request made at 12pm on a Monday should be 4pm on the Monday', function() {
            createdAt = '2018-05-14T00:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-14 04:00:00.000');
        });

        it('requestDue for a request made at 9pm on a Monday should be 1pm on the Tuesday', function() {
            createdAt = '2018-05-14T09:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-15 01:00:00.000');
        });

        it('requestDue for a request made at 9pm on a Wednesday should be 1pm on the Thursday', function() {
            createdAt = '2018-05-16T09:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-17 01:00:00.000');
        });

        it('requestDue for a request made at 8am on a Thursday should be 1pm on the Thursday', function() {
            createdAt = '2018-05-16T20:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-17 01:00:00.000');
        });

        it('requestDue for a request made at 4pm on a Friday should be 12pm on the following Monday', function() {
            createdAt = '2018-05-18T04:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-05-21 00:00:00.000');
        });

        it('requestDue for a request made at 9am on NYE (a Sunday) should be 1pm on Wednesday 3rd January', function() {
            createdAt = '2017-12-30T20:00:00'; //UTC time so equivalent to 2017-12-31 09:00 in Pacific/Auckland time
            requestDue(moment(createdAt, moment.ISO_8601), sla, holidays).format(full).should.equal('2018-01-03 00:00:00.000');
        });
    });
});
