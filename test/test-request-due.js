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

        it('should report a Pacific/Auckland time that is 5am on a Monday as not being working time', function() {
            createdAt = '2018-05-13T17:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.isWorkingTime().should.be.false;
        });

        it('should report a Pacific/Auckland time that is 6am on a Monday as being working time', function() {
            createdAt = '2018-05-13T18:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.isWorkingTime().should.be.true;          
        });

    });

    describe('nextWorkingTime using Pacific/Auckland workingHours in locale', function() {

        it('nextWorkingTime for 5am on a Monday in Pacific/Auckland time should be 6am on that Monday', function() {
            createdAt = '2018-05-13T17:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.nextWorkingTime().format(full).should.equal('2018-05-14 06:00:00.000');
        });
        
        it('nextWorkingTime for 6am on a Monday in Pacific/Auckland time should be 6am on that Monday', function() {
            createdAt = '2018-05-13T18:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.nextWorkingTime().format(full).should.equal('2018-05-14 06:00:00.000');
        });
        
        it('nextWorkingTime for 6pm on a Thursday in Pacific/Auckland time should be 6am on the Friday', function() {
            createdAt = '2018-05-17T06:00:00'; // UTC Thursday morning is Thursday night for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.nextWorkingTime().format(full).should.equal('2018-05-18 06:00:00.000');
        });
        
        it('nextWorkingTime for 6pm on a Friday in Pacific/Auckland time should be 6am on the following Monday', function() {
            createdAt = '2018-05-18T06:00:00'; // UTC Friday morning is Friday night for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.nextWorkingTime().format(full).should.equal('2018-05-21 06:00:00.000');
        });

    });

    describe('addWorkingTime using Pacific/Auckland workingHours in locale', function() {

        it('add two working days for 6am on a Monday in Pacific/Auckland time should give 6am on Wednesday', function() {
            createdAt = '2018-05-13T18:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(2, 'days').format(full).should.equal('2018-05-16 06:00:00.000');
        });

        it('add 1 working day for 6am on a Thursday in Pacific/Auckland time should give 6am on the Friday', function() {
            createdAt = '2018-05-16T18:00:00'; // UTC Wednesday night is Thursday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(1, 'days').format(full).should.equal('2018-05-18 06:00:00.000');
        });

        it('add 2 working days for 6am on a Thursday in Pacific/Auckland time should give 6am on the following Monday', function() {
            createdAt = '2018-05-16T18:00:00'; // UTC Wednesday night is Thursday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(2, 'days').format(full).should.equal('2018-05-21 06:00:00.000');
        });

        it('add 2 working days for 6am on a Friday in Pacific/Auckland time should give 6am on the following Tuesday', function() {
            createdAt = '2018-05-17T18:00:00'; // UTC Thursday night is Friday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            pacificAucklandCreatedAtWithoutOffset.addWorkingTime(2, 'days').format(full).should.equal('2018-05-22 06:00:00.000');
        });
    });

    describe('endOfWorkingDay using Pacific/Auckland workingHours in locale', function() {

        it('endOfWorkingDay for a non-working day should return null', function() {
            createdAt = '2018-05-12T17:00:00'; // UTC Saturday night is Sunday morning for Pacific/Auckland
            var pacificAucklandCreatedAtWithoutOffset = moment(createdAt).addPacificAucklandUTCOffsetToDate();

            moment.updateLocale('en', requestSlaLocale);
            expect(pacificAucklandCreatedAtWithoutOffset.endOfWorkingDay()).to.be.null;
        });
        
        it('endOfWorkingDay for 6am on a Monday in Pacific/Auckland time should be 5pm on that Monday', function() {
            createdAt = '2018-05-13T18:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
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
        
        it('nextWorkingTime for 3pm on a Friday in Pacific/Auckland time should be 5pm on that Friday', function() {
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

    describe('requestDue using Pacific/Auckland workingHours in locale', function() {
        
        it('requestDue for a request made at 5am on a Monday should be 5pm on the Tuesday', function() {
            createdAt = '2018-05-13T17:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-05-15 05:00:00.000');
        });

        it('requestDue for a request made at one minute before 6am on a Monday should be 5pm on the Tuesday', function() {
            createdAt = '2018-05-13T17:59:59'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-05-15 05:00:00.000');
        });

        it('requestDue for a request made at 6am on a Monday should be 5pm on the Wednesday', function() {
            createdAt = '2018-05-13T18:00:00'; // UTC Sunday night is Monday morning for Pacific/Auckland
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-05-16 05:00:00.000');
        });

        it('requestDue for a request made at 12pm on a Monday should be 5pm on the Wednesday', function() {
            createdAt = '2018-05-14T00:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-05-16 05:00:00.000');
        });

        it('requestDue for a request made at 9pm on a Monday should be 5pm on the Wednesday', function() {
            createdAt = '2018-05-14T09:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-05-16 05:00:00.000');
        });

        it('requestDue for a request made at 9pm on a Wednesday should be 5pm on the Friday', function() {
            createdAt = '2018-05-16T09:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-05-18 05:00:00.000');
        });

        it('requestDue for a request made at 5am on a Thursay should be 5pm on the Friday', function() {
            createdAt = '2018-05-16T17:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-05-18 05:00:00.000');
        });

        it('requestDue for a request made at 6am on a Thursay should be 5pm on the following Monday', function() {
            createdAt = '2018-05-16T18:00:00';
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-05-21 05:00:00.000');
        });

        it('requestDue for a request made at 7am on NYE should be 5pm on Thursday 4th January', function() {
            createdAt = '2017-12-30T18:00:00'; //UTC time so equivalent to 2017-12-31 07:00 in Pacific/Auckland time
            requestDue(moment(createdAt, moment.ISO_8601), 2, holidays).format(full).should.equal('2018-01-04 05:00:00.000');
        });

    });

});
