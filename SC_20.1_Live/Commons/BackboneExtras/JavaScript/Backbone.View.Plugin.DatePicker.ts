/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.View.Plugin.DatePicker"/>

import * as _ from 'underscore';
import '../../Utilities/JavaScript/bootstrap-datepicker';
import * as Utils from '../../Utilities/JavaScript/Utils';

import * as jQuery from '../../Core/JavaScript/jQuery';

import BackboneView = require('./Backbone.View.render');

/*
@module BackboneExtras
#Backbone.View.Plugins
Define the default plugins to execute by Backbone.View.render method. These plugins hook into the Backobne.view
render() life cycle and modify the view's output somehow, for example removing marked nodes that current user
has not permission to see, installing bootstrap widgets after a view is rendered, etc.
*/

export = {
    mountToApp: function() {
        if (!_.result(SC, 'isPageGenerator')) {
            BackboneView.postRender.install({
                name: 'datePicker',
                priority: 10,
                execute: function(_$el, view) {
                    if (Utils.isNativeDatePickerSupported() === false || Utils.isDesktopDevice()) {
                        view.$('input[type="date"]').each(function() {
                            const $date_picker = <any>jQuery(this);
                            try {
                                $date_picker.attr('type', 'text');
                            } catch (ex) {
                                // Attempting to change the type attribute (or property) of an input element created via HTML or already in an HTML document will
                                // result in an error being thrown by Internet Explorer 6, 7, or 8. That's OK since IE wont understand type="date", but chrome and others should change it.
                            }

                            $date_picker.datepicker.dates.ar = {
                                days: [
                                    'الأحد',
                                    'الاثنين',
                                    'الثلاثاء',
                                    'الأربعاء',
                                    'الخميس',
                                    'الجمعة',
                                    'السبت',
                                    'الأحد'
                                ],
                                daysShort: [
                                    'أحد',
                                    'اثنين',
                                    'ثلاثاء',
                                    'أربعاء',
                                    'خميس',
                                    'جمعة',
                                    'سبت',
                                    'أحد'
                                ],
                                daysMin: ['ح', 'ن', 'ث', 'ع', 'خ', 'ج', 'س', 'ح'],
                                months: [
                                    'جانفي',
                                    'فيفري',
                                    'مارس',
                                    'أفريل',
                                    'ماي',
                                    'جوان',
                                    'جويليه',
                                    'أوت',
                                    'سبتمبر',
                                    'أكتوبر',
                                    'نوفمبر',
                                    'ديسمبر'
                                ],
                                monthsShort: [
                                    'جانفي',
                                    'فيفري',
                                    'مارس',
                                    'أفريل',
                                    'ماي',
                                    'جوان',
                                    'جويليه',
                                    'أوت',
                                    'سبتمبر',
                                    'أكتوبر',
                                    'نوفمبر',
                                    'ديسمبر'
                                ],
                                today: 'هذا اليوم',
                                rtl: true
                            };

                            $date_picker.datepicker.dates.az = {
                                days: [
                                    'Bazar',
                                    'Bazar ertəsi',
                                    'Çərşənbə axşamı',
                                    'Çərşənbə',
                                    'Cümə axşamı',
                                    'Cümə',
                                    'Şənbə'
                                ],
                                daysShort: ['B.', 'B.e', 'Ç.a', 'Ç.', 'C.a', 'C.', 'Ş.'],
                                daysMin: ['B.', 'B.e', 'Ç.a', 'Ç.', 'C.a', 'C.', 'Ş.'],
                                months: [
                                    'Yanvar',
                                    'Fevral',
                                    'Mart',
                                    'Aprel',
                                    'May',
                                    'İyun',
                                    'İyul',
                                    'Avqust',
                                    'Sentyabr',
                                    'Oktyabr',
                                    'Noyabr',
                                    'Dekabr'
                                ],
                                monthsShort: [
                                    'Yan',
                                    'Fev',
                                    'Mar',
                                    'Apr',
                                    'May',
                                    'İyun',
                                    'İyul',
                                    'Avq',
                                    'Sen',
                                    'Okt',
                                    'Noy',
                                    'Dek'
                                ],
                                today: 'Bu gün',
                                weekStart: 1
                            };

                            $date_picker.datepicker.dates.bg = {
                                days: [
                                    'Неделя',
                                    'Понеделник',
                                    'Вторник',
                                    'Сряда',
                                    'Четвъртък',
                                    'Петък',
                                    'Събота'
                                ],
                                daysShort: ['Нед', 'Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб'],
                                daysMin: ['Н', 'П', 'В', 'С', 'Ч', 'П', 'С'],
                                months: [
                                    'Януари',
                                    'Февруари',
                                    'Март',
                                    'Април',
                                    'Май',
                                    'Юни',
                                    'Юли',
                                    'Август',
                                    'Септември',
                                    'Октомври',
                                    'Ноември',
                                    'Декември'
                                ],
                                monthsShort: [
                                    'Ян',
                                    'Фев',
                                    'Мар',
                                    'Апр',
                                    'Май',
                                    'Юни',
                                    'Юли',
                                    'Авг',
                                    'Сеп',
                                    'Окт',
                                    'Ное',
                                    'Дек'
                                ],
                                today: 'днес'
                            };

                            $date_picker.datepicker.dates.bn = {
                                days: [
                                    'রবিবার',
                                    'সোমবার',
                                    'মঙ্গলবার',
                                    'বুধবার',
                                    'বৃহস্পতিবার',
                                    'শুক্রবার',
                                    'শনিবার'
                                ],
                                daysShort: [
                                    'রবিবার',
                                    'সোমবার',
                                    'মঙ্গলবার',
                                    'বুধবার',
                                    'বৃহস্পতিবার',
                                    'শুক্রবার',
                                    'শনিবার'
                                ],
                                daysMin: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'],
                                months: [
                                    'জানুয়ারী',
                                    'ফেব্রুয়ারি',
                                    'মার্চ',
                                    'এপ্রিল',
                                    'মে',
                                    'জুন',
                                    'জুলাই',
                                    'অগাস্ট',
                                    'সেপ্টেম্বর',
                                    'অক্টোবর',
                                    'নভেম্বর',
                                    'ডিসেম্বর'
                                ],
                                monthsShort: [
                                    'জানুয়ারী',
                                    'ফেব্রুয়ারি',
                                    'মার্চ',
                                    'এপ্রিল',
                                    'মে',
                                    'জুন',
                                    'জুলাই',
                                    'অগাস্ট',
                                    'সেপ্টেম্বর',
                                    'অক্টোবর',
                                    'নভেম্বর',
                                    'ডিসেম্বর'
                                ],
                                today: 'আজ',
                                monthsTitle: 'মাস',
                                clear: 'পরিষ্কার',
                                weekStart: 0,
                                format: 'mm/dd/yyyy'
                            };

                            $date_picker.datepicker.dates.br = {
                                days: [
                                    'Sul',
                                    'Lun',
                                    'Meurzh',
                                    "Merc'her",
                                    'Yaou',
                                    'Gwener',
                                    'Sadorn'
                                ],
                                daysShort: ['Sul', 'Lun', 'Meu.', 'Mer.', 'Yao.', 'Gwe.', 'Sad.'],
                                daysMin: ['Su', 'L', 'Meu', 'Mer', 'Y', 'G', 'Sa'],
                                months: [
                                    'Genver',
                                    "C'hwevrer",
                                    'Meurzh',
                                    'Ebrel',
                                    'Mae',
                                    'Mezheven',
                                    'Gouere',
                                    'Eost',
                                    'Gwengolo',
                                    'Here',
                                    'Du',
                                    'Kerzu'
                                ],
                                monthsShort: [
                                    'Genv.',
                                    "C'hw.",
                                    'Meur.',
                                    'Ebre.',
                                    'Mae',
                                    'Mezh.',
                                    'Goue.',
                                    'Eost',
                                    'Gwen.',
                                    'Here',
                                    'Du',
                                    'Kerz.'
                                ],
                                today: 'Hiziv',
                                monthsTitle: 'Miz',
                                clear: 'Dilemel',
                                weekStart: 1,
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.bs = {
                                days: [
                                    'Nedjelja',
                                    'Ponedjeljak',
                                    'Utorak',
                                    'Srijeda',
                                    'Četvrtak',
                                    'Petak',
                                    'Subota'
                                ],
                                daysShort: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
                                daysMin: ['N', 'Po', 'U', 'Sr', 'Č', 'Pe', 'Su'],
                                months: [
                                    'Januar',
                                    'Februar',
                                    'Mart',
                                    'April',
                                    'Maj',
                                    'Juni',
                                    'Juli',
                                    'August',
                                    'Septembar',
                                    'Oktobar',
                                    'Novembar',
                                    'Decembar'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Aug',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Danas',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.ca = {
                                days: [
                                    'Diumenge',
                                    'Dilluns',
                                    'Dimarts',
                                    'Dimecres',
                                    'Dijous',
                                    'Divendres',
                                    'Dissabte'
                                ],
                                daysShort: ['Diu', 'Dil', 'Dmt', 'Dmc', 'Dij', 'Div', 'Dis'],
                                daysMin: ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'],
                                months: [
                                    'Gener',
                                    'Febrer',
                                    'Març',
                                    'Abril',
                                    'Maig',
                                    'Juny',
                                    'Juliol',
                                    'Agost',
                                    'Setembre',
                                    'Octubre',
                                    'Novembre',
                                    'Desembre'
                                ],
                                monthsShort: [
                                    'Gen',
                                    'Feb',
                                    'Mar',
                                    'Abr',
                                    'Mai',
                                    'Jun',
                                    'Jul',
                                    'Ago',
                                    'Set',
                                    'Oct',
                                    'Nov',
                                    'Des'
                                ],
                                today: 'Avui',
                                monthsTitle: 'Mesos',
                                clear: 'Esborrar',
                                weekStart: 1,
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.cs = {
                                days: [
                                    'Neděle',
                                    'Pondělí',
                                    'Úterý',
                                    'Středa',
                                    'Čtvrtek',
                                    'Pátek',
                                    'Sobota'
                                ],
                                daysShort: ['Ned', 'Pon', 'Úte', 'Stř', 'Čtv', 'Pát', 'Sob'],
                                daysMin: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
                                months: [
                                    'Leden',
                                    'Únor',
                                    'Březen',
                                    'Duben',
                                    'Květen',
                                    'Červen',
                                    'Červenec',
                                    'Srpen',
                                    'Září',
                                    'Říjen',
                                    'Listopad',
                                    'Prosinec'
                                ],
                                monthsShort: [
                                    'Led',
                                    'Úno',
                                    'Bře',
                                    'Dub',
                                    'Kvě',
                                    'Čer',
                                    'Čnc',
                                    'Srp',
                                    'Zář',
                                    'Říj',
                                    'Lis',
                                    'Pro'
                                ],
                                today: 'Dnes',
                                clear: 'Vymazat',
                                monthsTitle: 'Měsíc',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.cy = {
                                days: [
                                    'Sul',
                                    'Llun',
                                    'Mawrth',
                                    'Mercher',
                                    'Iau',
                                    'Gwener',
                                    'Sadwrn'
                                ],
                                daysShort: ['Sul', 'Llu', 'Maw', 'Mer', 'Iau', 'Gwe', 'Sad'],
                                daysMin: ['Su', 'Ll', 'Ma', 'Me', 'Ia', 'Gwe', 'Sa'],
                                months: [
                                    'Ionawr',
                                    'Chewfror',
                                    'Mawrth',
                                    'Ebrill',
                                    'Mai',
                                    'Mehefin',
                                    'Gorfennaf',
                                    'Awst',
                                    'Medi',
                                    'Hydref',
                                    'Tachwedd',
                                    'Rhagfyr'
                                ],
                                monthsShort: [
                                    'Ion',
                                    'Chw',
                                    'Maw',
                                    'Ebr',
                                    'Mai',
                                    'Meh',
                                    'Gor',
                                    'Aws',
                                    'Med',
                                    'Hyd',
                                    'Tach',
                                    'Rha'
                                ],
                                today: 'Heddiw'
                            };

                            $date_picker.datepicker.dates.da = {
                                days: [
                                    'Søndag',
                                    'Mandag',
                                    'Tirsdag',
                                    'Onsdag',
                                    'Torsdag',
                                    'Fredag',
                                    'Lørdag'
                                ],
                                daysShort: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
                                daysMin: ['Sø', 'Ma', 'Ti', 'On', 'To', 'Fr', 'Lø'],
                                months: [
                                    'Januar',
                                    'Februar',
                                    'Marts',
                                    'April',
                                    'Maj',
                                    'Juni',
                                    'Juli',
                                    'August',
                                    'September',
                                    'Oktober',
                                    'November',
                                    'December'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Aug',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'I Dag',
                                weekStart: 1,
                                clear: 'Nulstil',
                                format: 'dd/mm/yyyy',
                                monthsTitle: 'Måneder'
                            };

                            $date_picker.datepicker.dates.de = {
                                days: [
                                    'Sonntag',
                                    'Montag',
                                    'Dienstag',
                                    'Mittwoch',
                                    'Donnerstag',
                                    'Freitag',
                                    'Samstag'
                                ],
                                daysShort: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'],
                                daysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                                months: [
                                    'Januar',
                                    'Februar',
                                    'März',
                                    'April',
                                    'Mai',
                                    'Juni',
                                    'Juli',
                                    'August',
                                    'September',
                                    'Oktober',
                                    'November',
                                    'Dezember'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mär',
                                    'Apr',
                                    'Mai',
                                    'Jun',
                                    'Jul',
                                    'Aug',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dez'
                                ],
                                today: 'Heute',
                                monthsTitle: 'Monate',
                                clear: 'Löschen',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.el = {
                                days: [
                                    'Κυριακή',
                                    'Δευτέρα',
                                    'Τρίτη',
                                    'Τετάρτη',
                                    'Πέμπτη',
                                    'Παρασκευή',
                                    'Σάββατο'
                                ],
                                daysShort: ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'],
                                daysMin: ['Κυ', 'Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα'],
                                months: [
                                    'Ιανουάριος',
                                    'Φεβρουάριος',
                                    'Μάρτιος',
                                    'Απρίλιος',
                                    'Μάιος',
                                    'Ιούνιος',
                                    'Ιούλιος',
                                    'Αύγουστος',
                                    'Σεπτέμβριος',
                                    'Οκτώβριος',
                                    'Νοέμβριος',
                                    'Δεκέμβριος'
                                ],
                                monthsShort: [
                                    'Ιαν',
                                    'Φεβ',
                                    'Μαρ',
                                    'Απρ',
                                    'Μάι',
                                    'Ιουν',
                                    'Ιουλ',
                                    'Αυγ',
                                    'Σεπ',
                                    'Οκτ',
                                    'Νοε',
                                    'Δεκ'
                                ],
                                today: 'Σήμερα',
                                clear: 'Καθαρισμός',
                                weekStart: 1,
                                format: 'd/m/yyyy'
                            };

                            $date_picker.datepicker.dates.eo = {
                                days: [
                                    'dimanĉo',
                                    'lundo',
                                    'mardo',
                                    'merkredo',
                                    'ĵaŭdo',
                                    'vendredo',
                                    'sabato'
                                ],
                                daysShort: ['dim.', 'lun.', 'mar.', 'mer.', 'ĵaŭ.', 'ven.', 'sam.'],
                                daysMin: ['d', 'l', 'ma', 'me', 'ĵ', 'v', 's'],
                                months: [
                                    'januaro',
                                    'februaro',
                                    'marto',
                                    'aprilo',
                                    'majo',
                                    'junio',
                                    'julio',
                                    'aŭgusto',
                                    'septembro',
                                    'oktobro',
                                    'novembro',
                                    'decembro'
                                ],
                                monthsShort: [
                                    'jan.',
                                    'feb.',
                                    'mar.',
                                    'apr.',
                                    'majo',
                                    'jun.',
                                    'jul.',
                                    'aŭg.',
                                    'sep.',
                                    'okt.',
                                    'nov.',
                                    'dec.'
                                ],
                                today: 'Hodiaŭ',
                                clear: 'Nuligi',
                                weekStart: 1,
                                format: 'yyyy-mm-dd'
                            };

                            $date_picker.datepicker.dates.es = {
                                days: [
                                    'Domingo',
                                    'Lunes',
                                    'Martes',
                                    'Miércoles',
                                    'Jueves',
                                    'Viernes',
                                    'Sábado'
                                ],
                                daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                                daysMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
                                months: [
                                    'Enero',
                                    'Febrero',
                                    'Marzo',
                                    'Abril',
                                    'Mayo',
                                    'Junio',
                                    'Julio',
                                    'Agosto',
                                    'Septiembre',
                                    'Octubre',
                                    'Noviembre',
                                    'Diciembre'
                                ],
                                monthsShort: [
                                    'Ene',
                                    'Feb',
                                    'Mar',
                                    'Abr',
                                    'May',
                                    'Jun',
                                    'Jul',
                                    'Ago',
                                    'Sep',
                                    'Oct',
                                    'Nov',
                                    'Dic'
                                ],
                                today: 'Hoy',
                                monthsTitle: 'Meses',
                                clear: 'Borrar',
                                weekStart: 1,
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.et = {
                                days: [
                                    'Pühapäev',
                                    'Esmaspäev',
                                    'Teisipäev',
                                    'Kolmapäev',
                                    'Neljapäev',
                                    'Reede',
                                    'Laupäev'
                                ],
                                daysShort: [
                                    'Pühap',
                                    'Esmasp',
                                    'Teisip',
                                    'Kolmap',
                                    'Neljap',
                                    'Reede',
                                    'Laup'
                                ],
                                daysMin: ['P', 'E', 'T', 'K', 'N', 'R', 'L'],
                                months: [
                                    'Jaanuar',
                                    'Veebruar',
                                    'Märts',
                                    'Aprill',
                                    'Mai',
                                    'Juuni',
                                    'Juuli',
                                    'August',
                                    'September',
                                    'Oktoober',
                                    'November',
                                    'Detsember'
                                ],
                                monthsShort: [
                                    'Jaan',
                                    'Veebr',
                                    'Märts',
                                    'Apr',
                                    'Mai',
                                    'Juuni',
                                    'Juuli',
                                    'Aug',
                                    'Sept',
                                    'Okt',
                                    'Nov',
                                    'Dets'
                                ],
                                today: 'Täna',
                                clear: 'Tühjenda',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.eu = {
                                days: [
                                    'Igandea',
                                    'Astelehena',
                                    'Asteartea',
                                    'Asteazkena',
                                    'Osteguna',
                                    'Ostirala',
                                    'Larunbata'
                                ],
                                daysShort: ['Ig', 'Al', 'Ar', 'Az', 'Og', 'Ol', 'Lr'],
                                daysMin: ['Ig', 'Al', 'Ar', 'Az', 'Og', 'Ol', 'Lr'],
                                months: [
                                    'Urtarrila',
                                    'Otsaila',
                                    'Martxoa',
                                    'Apirila',
                                    'Maiatza',
                                    'Ekaina',
                                    'Uztaila',
                                    'Abuztua',
                                    'Iraila',
                                    'Urria',
                                    'Azaroa',
                                    'Abendua'
                                ],
                                monthsShort: [
                                    'Urt',
                                    'Ots',
                                    'Mar',
                                    'Api',
                                    'Mai',
                                    'Eka',
                                    'Uzt',
                                    'Abu',
                                    'Ira',
                                    'Urr',
                                    'Aza',
                                    'Abe'
                                ],
                                today: 'Gaur',
                                monthsTitle: 'Hilabeteak',
                                clear: 'Ezabatu',
                                weekStart: 1,
                                format: 'yyyy/mm/dd'
                            };

                            $date_picker.datepicker.dates.fa = {
                                days: [
                                    'یک‌شنبه',
                                    'دوشنبه',
                                    'سه‌شنبه',
                                    'چهارشنبه',
                                    'پنج‌شنبه',
                                    'جمعه',
                                    'شنبه',
                                    'یک‌شنبه'
                                ],
                                daysShort: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه', 'یک'],
                                daysMin: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش', 'ی'],
                                months: [
                                    'ژانویه',
                                    'فوریه',
                                    'مارس',
                                    'آوریل',
                                    'مه',
                                    'ژوئن',
                                    'ژوئیه',
                                    'اوت',
                                    'سپتامبر',
                                    'اکتبر',
                                    'نوامبر',
                                    'دسامبر'
                                ],
                                monthsShort: [
                                    'ژان',
                                    'فور',
                                    'مار',
                                    'آور',
                                    'مه',
                                    'ژون',
                                    'ژوی',
                                    'اوت',
                                    'سپت',
                                    'اکت',
                                    'نوا',
                                    'دسا'
                                ],
                                today: 'امروز',
                                clear: 'پاک کن',
                                weekStart: 1,
                                format: 'yyyy/mm/dd'
                            };

                            $date_picker.datepicker.dates.fi = {
                                days: [
                                    'sunnuntai',
                                    'maanantai',
                                    'tiistai',
                                    'keskiviikko',
                                    'torstai',
                                    'perjantai',
                                    'lauantai'
                                ],
                                daysShort: ['sun', 'maa', 'tii', 'kes', 'tor', 'per', 'lau'],
                                daysMin: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
                                months: [
                                    'tammikuu',
                                    'helmikuu',
                                    'maaliskuu',
                                    'huhtikuu',
                                    'toukokuu',
                                    'kesäkuu',
                                    'heinäkuu',
                                    'elokuu',
                                    'syyskuu',
                                    'lokakuu',
                                    'marraskuu',
                                    'joulukuu'
                                ],
                                monthsShort: [
                                    'tam',
                                    'hel',
                                    'maa',
                                    'huh',
                                    'tou',
                                    'kes',
                                    'hei',
                                    'elo',
                                    'syy',
                                    'lok',
                                    'mar',
                                    'jou'
                                ],
                                today: 'tänään',
                                clear: 'Tyhjennä',
                                weekStart: 1,
                                format: 'd.m.yyyy'
                            };

                            $date_picker.datepicker.dates.fo = {
                                days: [
                                    'Sunnudagur',
                                    'Mánadagur',
                                    'Týsdagur',
                                    'Mikudagur',
                                    'Hósdagur',
                                    'Fríggjadagur',
                                    'Leygardagur'
                                ],
                                daysShort: ['Sun', 'Mán', 'Týs', 'Mik', 'Hós', 'Frí', 'Ley'],
                                daysMin: ['Su', 'Má', 'Tý', 'Mi', 'Hó', 'Fr', 'Le'],
                                months: [
                                    'Januar',
                                    'Februar',
                                    'Marts',
                                    'Apríl',
                                    'Mei',
                                    'Juni',
                                    'Juli',
                                    'August',
                                    'Septembur',
                                    'Oktobur',
                                    'Novembur',
                                    'Desembur'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Mei',
                                    'Jun',
                                    'Jul',
                                    'Aug',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Des'
                                ],
                                today: 'Í Dag',
                                clear: 'Reinsa'
                            };

                            $date_picker.datepicker.dates.fr = {
                                days: [
                                    'Dimanche',
                                    'Lundi',
                                    'Mardi',
                                    'Mercredi',
                                    'Jeudi',
                                    'Vendredi',
                                    'Samedi'
                                ],
                                daysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
                                daysMin: ['D', 'L', 'Ma', 'Me', 'J', 'V', 'S'],
                                months: [
                                    'Janvier',
                                    'Février',
                                    'Mars',
                                    'Avril',
                                    'Mai',
                                    'Juin',
                                    'Juillet',
                                    'Août',
                                    'Septembre',
                                    'Octobre',
                                    'Novembre',
                                    'Décembre'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Fév',
                                    'Mar',
                                    'Avr',
                                    'Mai',
                                    'Jui',
                                    'Jul',
                                    'Aou',
                                    'Sep',
                                    'Oct',
                                    'Nov',
                                    'Déc'
                                ],
                                today: "Aujourd'hui",
                                monthsTitle: 'Mois',
                                clear: 'Effacer',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.gl = {
                                days: [
                                    'Domingo',
                                    'Luns',
                                    'Martes',
                                    'Mércores',
                                    'Xoves',
                                    'Venres',
                                    'Sábado'
                                ],
                                daysShort: ['Dom', 'Lun', 'Mar', 'Mér', 'Xov', 'Ven', 'Sáb'],
                                daysMin: ['Do', 'Lu', 'Ma', 'Me', 'Xo', 'Ve', 'Sa'],
                                months: [
                                    'Xaneiro',
                                    'Febreiro',
                                    'Marzo',
                                    'Abril',
                                    'Maio',
                                    'Xuño',
                                    'Xullo',
                                    'Agosto',
                                    'Setembro',
                                    'Outubro',
                                    'Novembro',
                                    'Decembro'
                                ],
                                monthsShort: [
                                    'Xan',
                                    'Feb',
                                    'Mar',
                                    'Abr',
                                    'Mai',
                                    'Xun',
                                    'Xul',
                                    'Ago',
                                    'Sep',
                                    'Out',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Hoxe',
                                clear: 'Limpar',
                                weekStart: 1,
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.he = {
                                days: [
                                    'ראשון',
                                    'שני',
                                    'שלישי',
                                    'רביעי',
                                    'חמישי',
                                    'שישי',
                                    'שבת',
                                    'ראשון'
                                ],
                                daysShort: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש', 'א'],
                                daysMin: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש', 'א'],
                                months: [
                                    'ינואר',
                                    'פברואר',
                                    'מרץ',
                                    'אפריל',
                                    'מאי',
                                    'יוני',
                                    'יולי',
                                    'אוגוסט',
                                    'ספטמבר',
                                    'אוקטובר',
                                    'נובמבר',
                                    'דצמבר'
                                ],
                                monthsShort: [
                                    'ינו',
                                    'פבר',
                                    'מרץ',
                                    'אפר',
                                    'מאי',
                                    'יונ',
                                    'יול',
                                    'אוג',
                                    'ספט',
                                    'אוק',
                                    'נוב',
                                    'דצמ'
                                ],
                                today: 'היום',
                                rtl: true
                            };

                            $date_picker.datepicker.dates.hi = {
                                days: [
                                    'रविवार',
                                    'सोमवार',
                                    'मंगलवार',
                                    'बुधवार',
                                    'गुरुवार',
                                    'शुक्रवार',
                                    'शनिवार'
                                ],
                                daysShort: ['सूर्य', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
                                daysMin: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
                                months: [
                                    'जनवरी',
                                    'फ़रवरी',
                                    'मार्च',
                                    'अप्रैल',
                                    'मई',
                                    'जून',
                                    'जुलाई',
                                    'अगस्त',
                                    'सितम्बर',
                                    'अक्टूबर',
                                    'नवंबर',
                                    'दिसम्बर'
                                ],
                                monthsShort: [
                                    'जन',
                                    'फ़रवरी',
                                    'मार्च',
                                    'अप्रैल',
                                    'मई',
                                    'जून',
                                    'जुलाई',
                                    'अगस्त',
                                    'सितं',
                                    'अक्टूबर',
                                    'नवं',
                                    'दिसम्बर'
                                ],
                                today: 'आज',
                                monthsTitle: 'महीने',
                                clear: 'साफ',
                                weekStart: 1,
                                format: 'dd / mm / yyyy'
                            };

                            $date_picker.datepicker.dates.hr = {
                                days: [
                                    'Nedjelja',
                                    'Ponedjeljak',
                                    'Utorak',
                                    'Srijeda',
                                    'Četvrtak',
                                    'Petak',
                                    'Subota'
                                ],
                                daysShort: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
                                daysMin: ['Ne', 'Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su'],
                                months: [
                                    'Siječanj',
                                    'Veljača',
                                    'Ožujak',
                                    'Travanj',
                                    'Svibanj',
                                    'Lipanj',
                                    'Srpanj',
                                    'Kolovoz',
                                    'Rujan',
                                    'Listopad',
                                    'Studeni',
                                    'Prosinac'
                                ],
                                monthsShort: [
                                    'Sij',
                                    'Velj',
                                    'Ožu',
                                    'Tra',
                                    'Svi',
                                    'Lip',
                                    'Srp',
                                    'Kol',
                                    'Ruj',
                                    'Lis',
                                    'Stu',
                                    'Pro'
                                ],
                                today: 'Danas'
                            };

                            $date_picker.datepicker.dates.hu = {
                                days: [
                                    'vasárnap',
                                    'hétfő',
                                    'kedd',
                                    'szerda',
                                    'csütörtök',
                                    'péntek',
                                    'szombat'
                                ],
                                daysShort: ['vas', 'hét', 'ked', 'sze', 'csü', 'pén', 'szo'],
                                daysMin: ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'],
                                months: [
                                    'január',
                                    'február',
                                    'március',
                                    'április',
                                    'május',
                                    'június',
                                    'július',
                                    'augusztus',
                                    'szeptember',
                                    'október',
                                    'november',
                                    'december'
                                ],
                                monthsShort: [
                                    'jan',
                                    'feb',
                                    'már',
                                    'ápr',
                                    'máj',
                                    'jún',
                                    'júl',
                                    'aug',
                                    'sze',
                                    'okt',
                                    'nov',
                                    'dec'
                                ],
                                today: 'ma',
                                weekStart: 1,
                                clear: 'töröl',
                                titleFormat: 'yyyy. MM',
                                format: 'yyyy.mm.dd'
                            };

                            $date_picker.datepicker.dates.hy = {
                                days: [
                                    'Կիրակի',
                                    'Երկուշաբթի',
                                    'Երեքշաբթի',
                                    'Չորեքշաբթի',
                                    'Հինգշաբթի',
                                    'Ուրբաթ',
                                    'Շաբաթ'
                                ],
                                daysShort: ['Կիր', 'Երկ', 'Երե', 'Չոր', 'Հին', 'Ուրբ', 'Շաբ'],
                                daysMin: ['Կի', 'Եկ', 'Եք', 'Չո', 'Հի', 'Ու', 'Շա'],
                                months: [
                                    'Հունվար',
                                    'Փետրվար',
                                    'Մարտ',
                                    'Ապրիլ',
                                    'Մայիս',
                                    'Հունիս',
                                    'Հուլիս',
                                    'Օգոստոս',
                                    'Սեպտեմբեր',
                                    'Հոկտեմբեր',
                                    'Նոյեմբեր',
                                    'Դեկտեմբեր'
                                ],
                                monthsShort: [
                                    'Հնվ',
                                    'Փետ',
                                    'Մար',
                                    'Ապր',
                                    'Մայ',
                                    'Հուն',
                                    'Հուլ',
                                    'Օգս',
                                    'Սեպ',
                                    'Հոկ',
                                    'Նոյ',
                                    'Դեկ'
                                ],
                                today: 'Այսօր',
                                clear: 'Ջնջել',
                                format: 'dd.mm.yyyy',
                                weekStart: 1,
                                monthsTitle: 'Ամիսնէր'
                            };

                            $date_picker.datepicker.dates.id = {
                                days: [
                                    'Minggu',
                                    'Senin',
                                    'Selasa',
                                    'Rabu',
                                    'Kamis',
                                    'Jumat',
                                    'Sabtu'
                                ],
                                daysShort: ['Mgu', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
                                daysMin: ['Mg', 'Sn', 'Sl', 'Ra', 'Ka', 'Ju', 'Sa'],
                                months: [
                                    'Januari',
                                    'Februari',
                                    'Maret',
                                    'April',
                                    'Mei',
                                    'Juni',
                                    'Juli',
                                    'Agustus',
                                    'September',
                                    'Oktober',
                                    'November',
                                    'Desember'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Mei',
                                    'Jun',
                                    'Jul',
                                    'Ags',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Des'
                                ],
                                today: 'Hari Ini',
                                clear: 'Kosongkan'
                            };

                            $date_picker.datepicker.dates.is = {
                                days: [
                                    'Sunnudagur',
                                    'Mánudagur',
                                    'Þriðjudagur',
                                    'Miðvikudagur',
                                    'Fimmtudagur',
                                    'Föstudagur',
                                    'Laugardagur'
                                ],
                                daysShort: ['Sun', 'Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau'],
                                daysMin: ['Su', 'Má', 'Þr', 'Mi', 'Fi', 'Fö', 'La'],
                                months: [
                                    'Janúar',
                                    'Febrúar',
                                    'Mars',
                                    'Apríl',
                                    'Maí',
                                    'Júní',
                                    'Júlí',
                                    'Ágúst',
                                    'September',
                                    'Október',
                                    'Nóvember',
                                    'Desember'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Maí',
                                    'Jún',
                                    'Júl',
                                    'Ágú',
                                    'Sep',
                                    'Okt',
                                    'Nóv',
                                    'Des'
                                ],
                                today: 'Í Dag'
                            };

                            $date_picker.datepicker.dates.it = {
                                days: [
                                    'Domenica',
                                    'Lunedì',
                                    'Martedì',
                                    'Mercoledì',
                                    'Giovedì',
                                    'Venerdì',
                                    'Sabato'
                                ],
                                daysShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
                                daysMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
                                months: [
                                    'Gennaio',
                                    'Febbraio',
                                    'Marzo',
                                    'Aprile',
                                    'Maggio',
                                    'Giugno',
                                    'Luglio',
                                    'Agosto',
                                    'Settembre',
                                    'Ottobre',
                                    'Novembre',
                                    'Dicembre'
                                ],
                                monthsShort: [
                                    'Gen',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Mag',
                                    'Giu',
                                    'Lug',
                                    'Ago',
                                    'Set',
                                    'Ott',
                                    'Nov',
                                    'Dic'
                                ],
                                today: 'Oggi',
                                clear: 'Cancella',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.ja = {
                                days: ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'],
                                daysShort: ['日', '月', '火', '水', '木', '金', '土'],
                                daysMin: ['日', '月', '火', '水', '木', '金', '土'],
                                months: [
                                    '1月',
                                    '2月',
                                    '3月',
                                    '4月',
                                    '5月',
                                    '6月',
                                    '7月',
                                    '8月',
                                    '9月',
                                    '10月',
                                    '11月',
                                    '12月'
                                ],
                                monthsShort: [
                                    '1月',
                                    '2月',
                                    '3月',
                                    '4月',
                                    '5月',
                                    '6月',
                                    '7月',
                                    '8月',
                                    '9月',
                                    '10月',
                                    '11月',
                                    '12月'
                                ],
                                today: '今日',
                                format: 'yyyy/mm/dd',
                                titleFormat: 'yyyy年mm月',
                                clear: 'クリア'
                            };

                            $date_picker.datepicker.dates.ka = {
                                days: [
                                    'კვირა',
                                    'ორშაბათი',
                                    'სამშაბათი',
                                    'ოთხშაბათი',
                                    'ხუთშაბათი',
                                    'პარასკევი',
                                    'შაბათი'
                                ],
                                daysShort: ['კვი', 'ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ'],
                                daysMin: ['კვ', 'ორ', 'სა', 'ოთ', 'ხუ', 'პა', 'შა'],
                                months: [
                                    'იანვარი',
                                    'თებერვალი',
                                    'მარტი',
                                    'აპრილი',
                                    'მაისი',
                                    'ივნისი',
                                    'ივლისი',
                                    'აგვისტო',
                                    'სექტემბერი',
                                    'ოქტომბერი',
                                    'ნოემბერი',
                                    'დეკემბერი'
                                ],
                                monthsShort: [
                                    'იან',
                                    'თებ',
                                    'მარ',
                                    'აპრ',
                                    'მაი',
                                    'ივნ',
                                    'ივლ',
                                    'აგვ',
                                    'სექ',
                                    'ოქტ',
                                    'ნოე',
                                    'დეკ'
                                ],
                                today: 'დღეს',
                                clear: 'გასუფთავება',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.kh = {
                                days: [
                                    'អាទិត្យ',
                                    'ចន្ទ',
                                    'អង្គារ',
                                    'ពុធ',
                                    'ព្រហស្បតិ៍',
                                    'សុក្រ',
                                    'សៅរ៍'
                                ],
                                daysShort: [
                                    'អា.ទិ',
                                    'ចន្ទ',
                                    'អង្គារ',
                                    'ពុធ',
                                    'ព្រ.ហ',
                                    'សុក្រ',
                                    'សៅរ៍'
                                ],
                                daysMin: [
                                    'អា.ទិ',
                                    'ចន្ទ',
                                    'អង្គារ',
                                    'ពុធ',
                                    'ព្រ.ហ',
                                    'សុក្រ',
                                    'សៅរ៍'
                                ],
                                months: [
                                    'មករា',
                                    'កុម្ភះ',
                                    'មិនា',
                                    'មេសា',
                                    'ឧសភា',
                                    'មិថុនា',
                                    'កក្កដា',
                                    'សីហា',
                                    'កញ្ញា',
                                    'តុលា',
                                    'វិច្ឆិកា',
                                    'ធ្នូ'
                                ],
                                monthsShort: [
                                    'មករា',
                                    'កុម្ភះ',
                                    'មិនា',
                                    'មេសា',
                                    'ឧសភា',
                                    'មិថុនា',
                                    'កក្កដា',
                                    'សីហា',
                                    'កញ្ញា',
                                    'តុលា',
                                    'វិច្ឆិកា',
                                    'ធ្នូ'
                                ],
                                today: 'ថ្ងៃនេះ',
                                clear: 'សំអាត'
                            };

                            $date_picker.datepicker.dates.kk = {
                                days: [
                                    'Жексенбі',
                                    'Дүйсенбі',
                                    'Сейсенбі',
                                    'Сәрсенбі',
                                    'Бейсенбі',
                                    'Жұма',
                                    'Сенбі'
                                ],
                                daysShort: ['Жек', 'Дүй', 'Сей', 'Сәр', 'Бей', 'Жұм', 'Сен'],
                                daysMin: ['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн'],
                                months: [
                                    'Қаңтар',
                                    'Ақпан',
                                    'Наурыз',
                                    'Сәуір',
                                    'Мамыр',
                                    'Маусым',
                                    'Шілде',
                                    'Тамыз',
                                    'Қыркүйек',
                                    'Қазан',
                                    'Қараша',
                                    'Желтоқсан'
                                ],
                                monthsShort: [
                                    'Қаң',
                                    'Ақп',
                                    'Нау',
                                    'Сәу',
                                    'Мам',
                                    'Мау',
                                    'Шіл',
                                    'Там',
                                    'Қыр',
                                    'Қаз',
                                    'Қар',
                                    'Жел'
                                ],
                                today: 'Бүгін',
                                weekStart: 1
                            };

                            $date_picker.datepicker.dates.km = {
                                days: [
                                    'អាទិត្យ',
                                    'ចន្ទ',
                                    'អង្គារ',
                                    'ពុធ',
                                    'ព្រហស្បតិ៍',
                                    'សុក្រ',
                                    'សៅរ៍'
                                ],
                                daysShort: [
                                    'អា.ទិ',
                                    'ចន្ទ',
                                    'អង្គារ',
                                    'ពុធ',
                                    'ព្រ.ហ',
                                    'សុក្រ',
                                    'សៅរ៍'
                                ],
                                daysMin: [
                                    'អា.ទិ',
                                    'ចន្ទ',
                                    'អង្គារ',
                                    'ពុធ',
                                    'ព្រ.ហ',
                                    'សុក្រ',
                                    'សៅរ៍'
                                ],
                                months: [
                                    'មករា',
                                    'កុម្ភះ',
                                    'មិនា',
                                    'មេសា',
                                    'ឧសភា',
                                    'មិថុនា',
                                    'កក្កដា',
                                    'សីហា',
                                    'កញ្ញា',
                                    'តុលា',
                                    'វិច្ឆិកា',
                                    'ធ្នូ'
                                ],
                                monthsShort: [
                                    'មករា',
                                    'កុម្ភះ',
                                    'មិនា',
                                    'មេសា',
                                    'ឧសភា',
                                    'មិថុនា',
                                    'កក្កដា',
                                    'សីហា',
                                    'កញ្ញា',
                                    'តុលា',
                                    'វិច្ឆិកា',
                                    'ធ្នូ'
                                ],
                                today: 'ថ្ងៃនេះ',
                                clear: 'សំអាត'
                            };

                            $date_picker.datepicker.dates.ko = {
                                days: [
                                    '일요일',
                                    '월요일',
                                    '화요일',
                                    '수요일',
                                    '목요일',
                                    '금요일',
                                    '토요일'
                                ],
                                daysShort: ['일', '월', '화', '수', '목', '금', '토'],
                                daysMin: ['일', '월', '화', '수', '목', '금', '토'],
                                months: [
                                    '1월',
                                    '2월',
                                    '3월',
                                    '4월',
                                    '5월',
                                    '6월',
                                    '7월',
                                    '8월',
                                    '9월',
                                    '10월',
                                    '11월',
                                    '12월'
                                ],
                                monthsShort: [
                                    '1월',
                                    '2월',
                                    '3월',
                                    '4월',
                                    '5월',
                                    '6월',
                                    '7월',
                                    '8월',
                                    '9월',
                                    '10월',
                                    '11월',
                                    '12월'
                                ],
                                today: '오늘',
                                clear: '삭제',
                                format: 'yyyy-mm-dd',
                                titleFormat: 'yyyy년mm월',
                                weekStart: 0
                            };

                            $date_picker.datepicker.dates.kr = {
                                days: [
                                    '일요일',
                                    '월요일',
                                    '화요일',
                                    '수요일',
                                    '목요일',
                                    '금요일',
                                    '토요일'
                                ],
                                daysShort: ['일', '월', '화', '수', '목', '금', '토'],
                                daysMin: ['일', '월', '화', '수', '목', '금', '토'],
                                months: [
                                    '1월',
                                    '2월',
                                    '3월',
                                    '4월',
                                    '5월',
                                    '6월',
                                    '7월',
                                    '8월',
                                    '9월',
                                    '10월',
                                    '11월',
                                    '12월'
                                ],
                                monthsShort: [
                                    '1월',
                                    '2월',
                                    '3월',
                                    '4월',
                                    '5월',
                                    '6월',
                                    '7월',
                                    '8월',
                                    '9월',
                                    '10월',
                                    '11월',
                                    '12월'
                                ]
                            };

                            $date_picker.datepicker.dates.lt = {
                                days: [
                                    'Sekmadienis',
                                    'Pirmadienis',
                                    'Antradienis',
                                    'Trečiadienis',
                                    'Ketvirtadienis',
                                    'Penktadienis',
                                    'Šeštadienis'
                                ],
                                daysShort: ['S', 'Pr', 'A', 'T', 'K', 'Pn', 'Š'],
                                daysMin: ['Sk', 'Pr', 'An', 'Tr', 'Ke', 'Pn', 'Št'],
                                months: [
                                    'Sausis',
                                    'Vasaris',
                                    'Kovas',
                                    'Balandis',
                                    'Gegužė',
                                    'Birželis',
                                    'Liepa',
                                    'Rugpjūtis',
                                    'Rugsėjis',
                                    'Spalis',
                                    'Lapkritis',
                                    'Gruodis'
                                ],
                                monthsShort: [
                                    'Sau',
                                    'Vas',
                                    'Kov',
                                    'Bal',
                                    'Geg',
                                    'Bir',
                                    'Lie',
                                    'Rugp',
                                    'Rugs',
                                    'Spa',
                                    'Lap',
                                    'Gru'
                                ],
                                today: 'Šiandien',
                                monthsTitle: 'Mėnesiai',
                                clear: 'Išvalyti',
                                weekStart: 1,
                                format: 'yyyy-mm-dd'
                            };

                            $date_picker.datepicker.dates.lv = {
                                days: [
                                    'Svētdiena',
                                    'Pirmdiena',
                                    'Otrdiena',
                                    'Trešdiena',
                                    'Ceturtdiena',
                                    'Piektdiena',
                                    'Sestdiena'
                                ],
                                daysShort: ['Sv', 'P', 'O', 'T', 'C', 'Pk', 'S'],
                                daysMin: ['Sv', 'Pr', 'Ot', 'Tr', 'Ce', 'Pk', 'Se'],
                                months: [
                                    'Janvāris',
                                    'Februāris',
                                    'Marts',
                                    'Aprīlis',
                                    'Maijs',
                                    'Jūnijs',
                                    'Jūlijs',
                                    'Augusts',
                                    'Septembris',
                                    'Oktobris',
                                    'Novembris',
                                    'Decembris'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Mai',
                                    'Jūn',
                                    'Jūl',
                                    'Aug',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dec'
                                ],
                                monthsTitle: 'Mēneši',
                                today: 'Šodien',
                                clear: 'Nodzēst',
                                weekStart: 1
                            };

                            $date_picker.datepicker.dates.me = {
                                days: [
                                    'Nedjelja',
                                    'Ponedjeljak',
                                    'Utorak',
                                    'Srijeda',
                                    'Četvrtak',
                                    'Petak',
                                    'Subota'
                                ],
                                daysShort: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
                                daysMin: ['Ne', 'Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su'],
                                months: [
                                    'Januar',
                                    'Februar',
                                    'Mart',
                                    'April',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Avgust',
                                    'Septembar',
                                    'Oktobar',
                                    'Novembar',
                                    'Decembar'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Avg',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Danas',
                                weekStart: 1,
                                clear: 'Izbriši',
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.mk = {
                                days: [
                                    'Недела',
                                    'Понеделник',
                                    'Вторник',
                                    'Среда',
                                    'Четврток',
                                    'Петок',
                                    'Сабота'
                                ],
                                daysShort: ['Нед', 'Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб'],
                                daysMin: ['Не', 'По', 'Вт', 'Ср', 'Че', 'Пе', 'Са'],
                                months: [
                                    'Јануари',
                                    'Февруари',
                                    'Март',
                                    'Април',
                                    'Мај',
                                    'Јуни',
                                    'Јули',
                                    'Август',
                                    'Септември',
                                    'Октомври',
                                    'Ноември',
                                    'Декември'
                                ],
                                monthsShort: [
                                    'Јан',
                                    'Фев',
                                    'Мар',
                                    'Апр',
                                    'Мај',
                                    'Јун',
                                    'Јул',
                                    'Авг',
                                    'Сеп',
                                    'Окт',
                                    'Ное',
                                    'Дек'
                                ],
                                today: 'Денес',
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.mn = {
                                days: [
                                    'Ням',
                                    'Даваа',
                                    'Мягмар',
                                    'Лхагва',
                                    'Пүрэв',
                                    'Баасан',
                                    'Бямба'
                                ],
                                daysShort: ['Ням', 'Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям'],
                                daysMin: ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'],
                                months: [
                                    'Хулгана',
                                    'Үхэр',
                                    'Бар',
                                    'Туулай',
                                    'Луу',
                                    'Могой',
                                    'Морь',
                                    'Хонь',
                                    'Бич',
                                    'Тахиа',
                                    'Нохой',
                                    'Гахай'
                                ],
                                monthsShort: [
                                    'Хул',
                                    'Үхэ',
                                    'Бар',
                                    'Туу',
                                    'Луу',
                                    'Мог',
                                    'Мор',
                                    'Хон',
                                    'Бич',
                                    'Тах',
                                    'Нох',
                                    'Гах'
                                ],
                                today: 'Өнөөдөр',
                                clear: 'Тодорхой',
                                format: 'yyyy.mm.dd',
                                weekStart: 1
                            };

                            $date_picker.datepicker.dates.ms = {
                                days: [
                                    'Ahad',
                                    'Isnin',
                                    'Selasa',
                                    'Rabu',
                                    'Khamis',
                                    'Jumaat',
                                    'Sabtu'
                                ],
                                daysShort: ['Aha', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
                                daysMin: ['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'],
                                months: [
                                    'Januari',
                                    'Februari',
                                    'Mac',
                                    'April',
                                    'Mei',
                                    'Jun',
                                    'Julai',
                                    'Ogos',
                                    'September',
                                    'Oktober',
                                    'November',
                                    'Disember'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Mei',
                                    'Jun',
                                    'Jul',
                                    'Ogo',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dis'
                                ],
                                today: 'Hari Ini',
                                clear: 'Bersihkan'
                            };

                            $date_picker.datepicker.dates.nl = {
                                days: [
                                    'zondag',
                                    'maandag',
                                    'dinsdag',
                                    'woensdag',
                                    'donderdag',
                                    'vrijdag',
                                    'zaterdag'
                                ],
                                daysShort: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
                                daysMin: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
                                months: [
                                    'januari',
                                    'februari',
                                    'maart',
                                    'april',
                                    'mei',
                                    'juni',
                                    'juli',
                                    'augustus',
                                    'september',
                                    'oktober',
                                    'november',
                                    'december'
                                ],
                                monthsShort: [
                                    'jan',
                                    'feb',
                                    'mrt',
                                    'apr',
                                    'mei',
                                    'jun',
                                    'jul',
                                    'aug',
                                    'sep',
                                    'okt',
                                    'nov',
                                    'dec'
                                ],
                                today: 'Vandaag',
                                monthsTitle: 'Maanden',
                                clear: 'Leegmaken',
                                weekStart: 1,
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.no = {
                                days: [
                                    'søndag',
                                    'mandag',
                                    'tirsdag',
                                    'onsdag',
                                    'torsdag',
                                    'fredag',
                                    'lørdag'
                                ],
                                daysShort: ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'],
                                daysMin: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'],
                                months: [
                                    'januar',
                                    'februar',
                                    'mars',
                                    'april',
                                    'mai',
                                    'juni',
                                    'juli',
                                    'august',
                                    'september',
                                    'oktober',
                                    'vovember',
                                    'desember'
                                ],
                                monthsShort: [
                                    'jan',
                                    'feb',
                                    'mar',
                                    'apr',
                                    'mai',
                                    'jun',
                                    'jul',
                                    'aug',
                                    'sep',
                                    'okt',
                                    'nov',
                                    'des'
                                ],
                                today: 'i dag',
                                monthsTitle: 'Måneder',
                                clear: 'Nullstill',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.oc = {
                                days: [
                                    'Dimenge',
                                    'Diluns',
                                    'Dimars',
                                    'Dimècres',
                                    'Dijòus',
                                    'Divendres',
                                    'Dissabte'
                                ],
                                daysShort: ['Dim', 'Dil', 'Dmr', 'Dmc', 'Dij', 'Div', 'Dis'],
                                daysMin: ['dg', 'dl', 'dr', 'dc', 'dj', 'dv', 'ds'],
                                months: [
                                    'Genièr',
                                    'Febrièr',
                                    'Març',
                                    'Abrial',
                                    'Mai',
                                    'Junh',
                                    'Julhet',
                                    'Agost',
                                    'Setembre',
                                    'Octobre',
                                    'Novembre',
                                    'Decembre'
                                ],
                                monthsShort: [
                                    'Gen',
                                    'Feb',
                                    'Mar',
                                    'Abr',
                                    'Mai',
                                    'Jun',
                                    'Jul',
                                    'Ago',
                                    'Set',
                                    'Oct',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Uèi',
                                monthsTitle: 'Meses',
                                clear: 'Escafar',
                                weekStart: 1,
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.pl = {
                                days: [
                                    'Niedziela',
                                    'Poniedziałek',
                                    'Wtorek',
                                    'Środa',
                                    'Czwartek',
                                    'Piątek',
                                    'Sobota'
                                ],
                                daysShort: [
                                    'Niedz.',
                                    'Pon.',
                                    'Wt.',
                                    'Śr.',
                                    'Czw.',
                                    'Piąt.',
                                    'Sob.'
                                ],
                                daysMin: ['Ndz.', 'Pn.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.'],
                                months: [
                                    'Styczeń',
                                    'Luty',
                                    'Marzec',
                                    'Kwiecień',
                                    'Maj',
                                    'Czerwiec',
                                    'Lipiec',
                                    'Sierpień',
                                    'Wrzesień',
                                    'Październik',
                                    'Listopad',
                                    'Grudzień'
                                ],
                                monthsShort: [
                                    'Sty.',
                                    'Lut.',
                                    'Mar.',
                                    'Kwi.',
                                    'Maj',
                                    'Cze.',
                                    'Lip.',
                                    'Sie.',
                                    'Wrz.',
                                    'Paź.',
                                    'Lis.',
                                    'Gru.'
                                ],
                                today: 'Dzisiaj',
                                weekStart: 1,
                                clear: 'Wyczyść',
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.pt = {
                                days: [
                                    'Domingo',
                                    'Segunda',
                                    'Terça',
                                    'Quarta',
                                    'Quinta',
                                    'Sexta',
                                    'Sábado'
                                ],
                                daysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                                daysMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
                                months: [
                                    'Janeiro',
                                    'Fevereiro',
                                    'Março',
                                    'Abril',
                                    'Maio',
                                    'Junho',
                                    'Julho',
                                    'Agosto',
                                    'Setembro',
                                    'Outubro',
                                    'Novembro',
                                    'Dezembro'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Fev',
                                    'Mar',
                                    'Abr',
                                    'Mai',
                                    'Jun',
                                    'Jul',
                                    'Ago',
                                    'Set',
                                    'Out',
                                    'Nov',
                                    'Dez'
                                ],
                                today: 'Hoje',
                                monthsTitle: 'Meses',
                                clear: 'Limpar',
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.ro = {
                                days: [
                                    'Duminică',
                                    'Luni',
                                    'Marţi',
                                    'Miercuri',
                                    'Joi',
                                    'Vineri',
                                    'Sâmbătă'
                                ],
                                daysShort: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
                                daysMin: ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'],
                                months: [
                                    'Ianuarie',
                                    'Februarie',
                                    'Martie',
                                    'Aprilie',
                                    'Mai',
                                    'Iunie',
                                    'Iulie',
                                    'August',
                                    'Septembrie',
                                    'Octombrie',
                                    'Noiembrie',
                                    'Decembrie'
                                ],
                                monthsShort: [
                                    'Ian',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Mai',
                                    'Iun',
                                    'Iul',
                                    'Aug',
                                    'Sep',
                                    'Oct',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Astăzi',
                                clear: 'Șterge',
                                weekStart: 1,
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.rs = {
                                days: [
                                    'Nedelja',
                                    'Ponedeljak',
                                    'Utorak',
                                    'Sreda',
                                    'Četvrtak',
                                    'Petak',
                                    'Subota'
                                ],
                                daysShort: ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'],
                                daysMin: ['N', 'Po', 'U', 'Sr', 'Č', 'Pe', 'Su'],
                                months: [
                                    'Januar',
                                    'Februar',
                                    'Mart',
                                    'April',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Avgust',
                                    'Septembar',
                                    'Oktobar',
                                    'Novembar',
                                    'Decembar'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Avg',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Danas',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.ru = {
                                days: [
                                    'Воскресенье',
                                    'Понедельник',
                                    'Вторник',
                                    'Среда',
                                    'Четверг',
                                    'Пятница',
                                    'Суббота'
                                ],
                                daysShort: ['Вск', 'Пнд', 'Втр', 'Срд', 'Чтв', 'Птн', 'Суб'],
                                daysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                                months: [
                                    'Январь',
                                    'Февраль',
                                    'Март',
                                    'Апрель',
                                    'Май',
                                    'Июнь',
                                    'Июль',
                                    'Август',
                                    'Сентябрь',
                                    'Октябрь',
                                    'Ноябрь',
                                    'Декабрь'
                                ],
                                monthsShort: [
                                    'Янв',
                                    'Фев',
                                    'Мар',
                                    'Апр',
                                    'Май',
                                    'Июн',
                                    'Июл',
                                    'Авг',
                                    'Сен',
                                    'Окт',
                                    'Ноя',
                                    'Дек'
                                ],
                                today: 'Сегодня',
                                clear: 'Очистить',
                                format: 'dd.mm.yyyy',
                                weekStart: 1,
                                monthsTitle: 'Месяцы'
                            };

                            $date_picker.datepicker.dates.si = {
                                days: [
                                    'ඉරිදා',
                                    'සඳුදා',
                                    'අඟහරුවාදා',
                                    'බදාදා',
                                    'බ්‍රහස්පතින්දා',
                                    'සිකුරාදා',
                                    'සෙනසුරාදා'
                                ],
                                daysShort: ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'],
                                daysMin: ['ඉ', 'ස', 'අ', 'බ', 'බ්‍ර', 'සි', 'සෙ'],
                                months: [
                                    'ජනවාරි',
                                    'පෙබරවාරි',
                                    'මාර්තු',
                                    'අප්‍රේල්',
                                    'මැයි',
                                    'ජුනි',
                                    'ජූලි',
                                    'අගෝස්තු',
                                    'සැප්තැම්බර්',
                                    'ඔක්තෝබර්',
                                    'නොවැම්බර්',
                                    'දෙසැම්බර්'
                                ],
                                monthsShort: [
                                    'ජන',
                                    'පෙබ',
                                    'මාර්',
                                    'අප්‍රේ',
                                    'මැයි',
                                    'ජුනි',
                                    'ජූලි',
                                    'අගෝ',
                                    'සැප්',
                                    'ඔක්',
                                    'නොවැ',
                                    'දෙසැ'
                                ],
                                today: 'අද',
                                monthsTitle: 'මාස',
                                clear: 'මකන්න',
                                weekStart: 0,
                                format: 'yyyy-mm-dd'
                            };

                            $date_picker.datepicker.dates.sk = {
                                days: [
                                    'Nedeľa',
                                    'Pondelok',
                                    'Utorok',
                                    'Streda',
                                    'Štvrtok',
                                    'Piatok',
                                    'Sobota'
                                ],
                                daysShort: ['Ned', 'Pon', 'Uto', 'Str', 'Štv', 'Pia', 'Sob'],
                                daysMin: ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pia', 'So'],
                                months: [
                                    'Január',
                                    'Február',
                                    'Marec',
                                    'Apríl',
                                    'Máj',
                                    'Jún',
                                    'Júl',
                                    'August',
                                    'September',
                                    'Október',
                                    'November',
                                    'December'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Máj',
                                    'Jún',
                                    'Júl',
                                    'Aug',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Dnes',
                                clear: 'Vymazať',
                                weekStart: 1,
                                format: 'd.m.yyyy'
                            };

                            $date_picker.datepicker.dates.sl = {
                                days: [
                                    'Nedelja',
                                    'Ponedeljek',
                                    'Torek',
                                    'Sreda',
                                    'Četrtek',
                                    'Petek',
                                    'Sobota'
                                ],
                                daysShort: ['Ned', 'Pon', 'Tor', 'Sre', 'Čet', 'Pet', 'Sob'],
                                daysMin: ['Ne', 'Po', 'To', 'Sr', 'Če', 'Pe', 'So'],
                                months: [
                                    'Januar',
                                    'Februar',
                                    'Marec',
                                    'April',
                                    'Maj',
                                    'Junij',
                                    'Julij',
                                    'Avgust',
                                    'September',
                                    'Oktober',
                                    'November',
                                    'December'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Avg',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Danes',
                                weekStart: 1
                            };

                            $date_picker.datepicker.dates.sq = {
                                days: [
                                    'E Diel',
                                    'E Hënë',
                                    'E Martē',
                                    'E Mërkurë',
                                    'E Enjte',
                                    'E Premte',
                                    'E Shtunë'
                                ],
                                daysShort: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Shtu'],
                                daysMin: ['Di', 'Hë', 'Ma', 'Më', 'En', 'Pr', 'Sht'],
                                months: [
                                    'Janar',
                                    'Shkurt',
                                    'Mars',
                                    'Prill',
                                    'Maj',
                                    'Qershor',
                                    'Korrik',
                                    'Gusht',
                                    'Shtator',
                                    'Tetor',
                                    'Nëntor',
                                    'Dhjetor'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Shk',
                                    'Mar',
                                    'Pri',
                                    'Maj',
                                    'Qer',
                                    'Korr',
                                    'Gu',
                                    'Sht',
                                    'Tet',
                                    'Nën',
                                    'Dhjet'
                                ],
                                today: 'Sot'
                            };

                            $date_picker.datepicker.dates.sr = {
                                days: [
                                    'Nedelja',
                                    'Ponedeljak',
                                    'Utorak',
                                    'Sreda',
                                    'Četvrtak',
                                    'Petak',
                                    'Subota'
                                ],
                                daysShort: ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'],
                                daysMin: ['N', 'Po', 'U', 'Sr', 'Č', 'Pe', 'Su'],
                                months: [
                                    'Januar',
                                    'Februar',
                                    'Mart',
                                    'April',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Avgust',
                                    'Septembar',
                                    'Oktobar',
                                    'Novembar',
                                    'Decembar'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'Maj',
                                    'Jun',
                                    'Jul',
                                    'Avg',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Dec'
                                ],
                                today: 'Danas',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.sv = {
                                days: [
                                    'söndag',
                                    'måndag',
                                    'tisdag',
                                    'onsdag',
                                    'torsdag',
                                    'fredag',
                                    'lördag'
                                ],
                                daysShort: ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'],
                                daysMin: ['sö', 'må', 'ti', 'on', 'to', 'fr', 'lö'],
                                months: [
                                    'januari',
                                    'februari',
                                    'mars',
                                    'april',
                                    'maj',
                                    'juni',
                                    'juli',
                                    'augusti',
                                    'september',
                                    'oktober',
                                    'november',
                                    'december'
                                ],
                                monthsShort: [
                                    'jan',
                                    'feb',
                                    'mar',
                                    'apr',
                                    'maj',
                                    'jun',
                                    'jul',
                                    'aug',
                                    'sep',
                                    'okt',
                                    'nov',
                                    'dec'
                                ],
                                today: 'Idag',
                                format: 'yyyy-mm-dd',
                                weekStart: 1,
                                clear: 'Rensa'
                            };

                            $date_picker.datepicker.dates.sw = {
                                days: [
                                    'Jumapili',
                                    'Jumatatu',
                                    'Jumanne',
                                    'Jumatano',
                                    'Alhamisi',
                                    'Ijumaa',
                                    'Jumamosi'
                                ],
                                daysShort: ['J2', 'J3', 'J4', 'J5', 'Alh', 'Ij', 'J1'],
                                daysMin: ['2', '3', '4', '5', 'A', 'I', '1'],
                                months: [
                                    'Januari',
                                    'Februari',
                                    'Machi',
                                    'Aprili',
                                    'Mei',
                                    'Juni',
                                    'Julai',
                                    'Agosti',
                                    'Septemba',
                                    'Oktoba',
                                    'Novemba',
                                    'Desemba'
                                ],
                                monthsShort: [
                                    'Jan',
                                    'Feb',
                                    'Mac',
                                    'Apr',
                                    'Mei',
                                    'Jun',
                                    'Jul',
                                    'Ago',
                                    'Sep',
                                    'Okt',
                                    'Nov',
                                    'Des'
                                ],
                                today: 'Leo'
                            };

                            $date_picker.datepicker.dates.ta = {
                                days: [
                                    'ஞாயிறு',
                                    'திங்கள்',
                                    'செவ்வாய்',
                                    'புதன்',
                                    'வியாழன்',
                                    'வெள்ளி',
                                    'சனி'
                                ],
                                daysShort: ['ஞாயி', 'திங்', 'செவ்', 'புத', 'வியா', 'வெள்', 'சனி'],
                                daysMin: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
                                months: [
                                    'ஜனவரி',
                                    'பிப்ரவரி',
                                    'மார்ச்',
                                    'ஏப்ரல்',
                                    'மே',
                                    'ஜூன்',
                                    'ஜூலை',
                                    'ஆகஸ்டு',
                                    'செப்டம்பர்',
                                    'அக்டோபர்',
                                    'நவம்பர்',
                                    'டிசம்பர்'
                                ],
                                monthsShort: [
                                    'ஜன',
                                    'பிப்',
                                    'மார்',
                                    'ஏப்',
                                    'மே',
                                    'ஜூன்',
                                    'ஜூலை',
                                    'ஆக',
                                    'செப்',
                                    'அக்',
                                    'நவ',
                                    'டிச'
                                ],
                                today: 'இன்று',
                                monthsTitle: 'மாதங்கள்',
                                clear: 'நீக்கு',
                                weekStart: 1,
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.tg = {
                                days: [
                                    'Якшанбе',
                                    'Душанбе',
                                    'Сешанбе',
                                    'Чоршанбе',
                                    'Панҷшанбе',
                                    'Ҷумъа',
                                    'Шанбе'
                                ],
                                daysShort: ['Яшб', 'Дшб', 'Сшб', 'Чшб', 'Пшб', 'Ҷум', 'Шнб'],
                                daysMin: ['Яш', 'Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шб'],
                                months: [
                                    'Январ',
                                    'Феврал',
                                    'Март',
                                    'Апрел',
                                    'Май',
                                    'Июн',
                                    'Июл',
                                    'Август',
                                    'Сентябр',
                                    'Октябр',
                                    'Ноябр',
                                    'Декабр'
                                ],
                                monthsShort: [
                                    'Янв',
                                    'Фев',
                                    'Мар',
                                    'Апр',
                                    'Май',
                                    'Июн',
                                    'Июл',
                                    'Авг',
                                    'Сен',
                                    'Окт',
                                    'Ноя',
                                    'Дек'
                                ],
                                today: 'Имрӯз',
                                monthsTitle: 'Моҳҳо',
                                clear: 'Тоза намудан',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.th = {
                                days: [
                                    'อาทิตย์',
                                    'จันทร์',
                                    'อังคาร',
                                    'พุธ',
                                    'พฤหัส',
                                    'ศุกร์',
                                    'เสาร์',
                                    'อาทิตย์'
                                ],
                                daysShort: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'],
                                daysMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'],
                                months: [
                                    'มกราคม',
                                    'กุมภาพันธ์',
                                    'มีนาคม',
                                    'เมษายน',
                                    'พฤษภาคม',
                                    'มิถุนายน',
                                    'กรกฎาคม',
                                    'สิงหาคม',
                                    'กันยายน',
                                    'ตุลาคม',
                                    'พฤศจิกายน',
                                    'ธันวาคม'
                                ],
                                monthsShort: [
                                    'ม.ค.',
                                    'ก.พ.',
                                    'มี.ค.',
                                    'เม.ย.',
                                    'พ.ค.',
                                    'มิ.ย.',
                                    'ก.ค.',
                                    'ส.ค.',
                                    'ก.ย.',
                                    'ต.ค.',
                                    'พ.ย.',
                                    'ธ.ค.'
                                ],
                                today: 'วันนี้'
                            };

                            $date_picker.datepicker.dates.tk = {
                                days: [
                                    'Ýekşenbe',
                                    'Duşenbe',
                                    'Sişenbe',
                                    'Çarşenbe',
                                    'Penşenbe',
                                    'Anna',
                                    'Şenbe'
                                ],
                                daysShort: ['Ýek', 'Duş', 'Siş', 'Çar', 'Pen', 'Ann', 'Şen'],
                                daysMin: ['Ýe', 'Du', 'Si', 'Ça', 'Pe', 'An', 'Şe'],
                                months: [
                                    'Ýanwar',
                                    'Fewral',
                                    'Mart',
                                    'Aprel',
                                    'Maý',
                                    'Iýun',
                                    'Iýul',
                                    'Awgust',
                                    'Sentýabr',
                                    'Oktýabr',
                                    'Noýabr',
                                    'Dekabr'
                                ],
                                monthsShort: [
                                    'Ýan',
                                    'Few',
                                    'Mar',
                                    'Apr',
                                    'Maý',
                                    'Iýn',
                                    'Iýl',
                                    'Awg',
                                    'Sen',
                                    'Okt',
                                    'Noý',
                                    'Dek'
                                ],
                                today: 'Bu gün',
                                monthsTitle: 'Aýlar',
                                clear: 'Aýyr',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.tr = {
                                days: [
                                    'Pazar',
                                    'Pazartesi',
                                    'Salı',
                                    'Çarşamba',
                                    'Perşembe',
                                    'Cuma',
                                    'Cumartesi'
                                ],
                                daysShort: ['Pz', 'Pzt', 'Sal', 'Çrş', 'Prş', 'Cu', 'Cts'],
                                daysMin: ['Pz', 'Pzt', 'Sa', 'Çr', 'Pr', 'Cu', 'Ct'],
                                months: [
                                    'Ocak',
                                    'Şubat',
                                    'Mart',
                                    'Nisan',
                                    'Mayıs',
                                    'Haziran',
                                    'Temmuz',
                                    'Ağustos',
                                    'Eylül',
                                    'Ekim',
                                    'Kasım',
                                    'Aralık'
                                ],
                                monthsShort: [
                                    'Oca',
                                    'Şub',
                                    'Mar',
                                    'Nis',
                                    'May',
                                    'Haz',
                                    'Tem',
                                    'Ağu',
                                    'Eyl',
                                    'Eki',
                                    'Kas',
                                    'Ara'
                                ],
                                today: 'Bugün',
                                clear: 'Temizle',
                                weekStart: 1,
                                format: 'dd.mm.yyyy'
                            };

                            $date_picker.datepicker.dates.uk = {
                                days: [
                                    'Неділя',
                                    'Понеділок',
                                    'Вівторок',
                                    'Середа',
                                    'Четвер',
                                    "П'ятниця",
                                    'Субота'
                                ],
                                daysShort: ['Нед', 'Пнд', 'Втр', 'Срд', 'Чтв', 'Птн', 'Суб'],
                                daysMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                                months: [
                                    'Cічень',
                                    'Лютий',
                                    'Березень',
                                    'Квітень',
                                    'Травень',
                                    'Червень',
                                    'Липень',
                                    'Серпень',
                                    'Вересень',
                                    'Жовтень',
                                    'Листопад',
                                    'Грудень'
                                ],
                                monthsShort: [
                                    'Січ',
                                    'Лют',
                                    'Бер',
                                    'Кві',
                                    'Тра',
                                    'Чер',
                                    'Лип',
                                    'Сер',
                                    'Вер',
                                    'Жов',
                                    'Лис',
                                    'Гру'
                                ],
                                today: 'Сьогодні',
                                clear: 'Очистити',
                                format: 'dd.mm.yyyy',
                                weekStart: 1
                            };

                            $date_picker.datepicker.dates.uz = {
                                days: [
                                    'Якшанба',
                                    'Душанба',
                                    'Сешанба',
                                    'Чоршанба',
                                    'Пайшанба',
                                    'Жума',
                                    'Шанба'
                                ],
                                daysShort: ['Якш', 'Ду', 'Се', 'Чор', 'Пай', 'Жу', 'Ша'],
                                daysMin: ['Як', 'Ду', 'Се', 'Чо', 'Па', 'Жу', 'Ша'],
                                months: [
                                    'Январь',
                                    'Февраль',
                                    'Март',
                                    'Апрель',
                                    'Май',
                                    'Июнь',
                                    'Июль',
                                    'Август',
                                    'Сентябрь',
                                    'Октябрь',
                                    'Ноябрь',
                                    'Декабрь'
                                ],
                                monthsShort: [
                                    'Янв',
                                    'Фев',
                                    'Мар',
                                    'Апр',
                                    'Май',
                                    'Июн',
                                    'Июл',
                                    'Авг',
                                    'Сен',
                                    'Окт',
                                    'Ноя',
                                    'Дек'
                                ],
                                today: 'Бугун',
                                clear: 'Ўчириш',
                                format: 'dd.mm.yyyy',
                                weekStart: 1,
                                monthsTitle: 'Ойлар'
                            };

                            $date_picker.datepicker.dates.vi = {
                                days: [
                                    'Chủ nhật',
                                    'Thứ hai',
                                    'Thứ ba',
                                    'Thứ tư',
                                    'Thứ năm',
                                    'Thứ sáu',
                                    'Thứ bảy'
                                ],
                                daysShort: [
                                    'CN',
                                    'Thứ 2',
                                    'Thứ 3',
                                    'Thứ 4',
                                    'Thứ 5',
                                    'Thứ 6',
                                    'Thứ 7'
                                ],
                                daysMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                                months: [
                                    'Tháng 1',
                                    'Tháng 2',
                                    'Tháng 3',
                                    'Tháng 4',
                                    'Tháng 5',
                                    'Tháng 6',
                                    'Tháng 7',
                                    'Tháng 8',
                                    'Tháng 9',
                                    'Tháng 10',
                                    'Tháng 11',
                                    'Tháng 12'
                                ],
                                monthsShort: [
                                    'Th1',
                                    'Th2',
                                    'Th3',
                                    'Th4',
                                    'Th5',
                                    'Th6',
                                    'Th7',
                                    'Th8',
                                    'Th9',
                                    'Th10',
                                    'Th11',
                                    'Th12'
                                ],
                                today: 'Hôm nay',
                                clear: 'Xóa',
                                format: 'dd/mm/yyyy'
                            };

                            $date_picker.datepicker.dates.zh = {
                                days: [
                                    '星期日',
                                    '星期一',
                                    '星期二',
                                    '星期三',
                                    '星期四',
                                    '星期五',
                                    '星期六'
                                ],
                                daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                                daysMin: ['日', '一', '二', '三', '四', '五', '六'],
                                months: [
                                    '一月',
                                    '二月',
                                    '三月',
                                    '四月',
                                    '五月',
                                    '六月',
                                    '七月',
                                    '八月',
                                    '九月',
                                    '十月',
                                    '十一月',
                                    '十二月'
                                ],
                                monthsShort: [
                                    '1月',
                                    '2月',
                                    '3月',
                                    '4月',
                                    '5月',
                                    '6月',
                                    '7月',
                                    '8月',
                                    '9月',
                                    '10月',
                                    '11月',
                                    '12月'
                                ],
                                today: '今日',
                                clear: '清除',
                                format: 'yyyy年mm月dd日',
                                titleFormat: 'yyyy年mm月',
                                weekStart: 1
                            };

                            $date_picker.datepicker({
                                format: $date_picker.data('format'),
                                startDate: $date_picker.data('start-date'),
                                endDate: $date_picker.data('end-date'),
                                autoclose: true,
                                zIndexOffset: 1200,
                                todayHighlight: $date_picker.data('todayhighlight'),
                                language:
                                    (SC.ENVIRONMENT.currentLanguage.locale &&
                                        SC.ENVIRONMENT.currentLanguage.locale.substring(0, 2)) ||
                                    'en'
                            });
                        });
                    }
                }
            });
        }
    }
};
