const _ = require('underscore');
const suitetalk = require('../src/index');

describe('item search tests', function() {
    const someItems = [];
    const itemNames = [];
    const pageSize = 6;

    // it('search websites', function(cb)
    // {
    // 	suitetalk.searchBasic({
    // 		recordType: 'website'
    // 	,	searchPreferences: {pageSize: pageSize}
    // 	})
    // 	.then(function(response)
    // 	{
    // 		expect(response.searchResponse[0].searchResult[0].recordList[0].record.length).toBe(pageSize);
    // 		_(response.searchResponse[0].searchResult[0].recordList[0].record).each(function(record)
    // 		{
    // 			someItems.push(record);
    // 			if(record.displayName)
    // 			{
    // 				itemNames.push(record.displayName[0]);
    // 			}
    // 		});
    // 		expect(itemNames.length > 0).toBe(true);
    // 		log('search item, count: '+itemNames.length);
    // 		cb();
    // 	})
    // 	.catch(function(error)
    // 	{
    // 		expect('no errors expected').toBeFalsy();
    // 		if(error)
    // 		{
    // 			console.log(error.stack);
    // 			expect('should be no errors').toBe(false);
    // 		}
    // 		cb();
    // 	});
    // });

    it('search products, no filter, store should contain at least one named item', function(cb) {
        suitetalk
            .searchBasic({
                recordType: 'item',
                searchPreferences: { pageSize: pageSize }
            })
            .then(function(response) {
                expect(response.searchResponse[0].searchResult[0].recordList[0].record.length).toBe(
                    pageSize
                );
                _(response.searchResponse[0].searchResult[0].recordList[0].record).each(function(
                    record
                ) {
                    someItems.push(record);
                    if (record.displayName) {
                        itemNames.push(record.displayName[0]);
                    }
                });
                expect(itemNames.length > 0).toBe(true);
                cb();
            })
            .catch(function(error) {
                expect('no errors expected').toBeFalsy();
                if (error) {
                    console.log(error.stack);
                    expect('should be no errors').toBe(false);
                }
                cb();
            });
    });

    it('now that we know some item names, search using a filter', function(cb) {
        suitetalk
            .searchBasic({
                recordType: 'item',
                filters: {
                    displayName: {
                        operator: 'startsWith',
                        searchValue: itemNames[0]
                    }
                }
            })
            .then(function(response) {
                _(response.searchResponse[0].searchResult[0].recordList[0].record).each(function(
                    record
                ) {
                    someItems.push(record);
                    if (record.displayName) {
                        itemNames.push(record.displayName[0]);
                    }
                });
                expect(itemNames.length > 0).toBe(true);
                cb();
            })
            .catch(function(error) {
                console.log(error.stack);
                expect(error).toBeFalsy();
                cb();
            });
    });

    it('search matrix parents', function(cb) {
        suitetalk
            .searchBasic({
                recordType: 'item',
                filters: {
                    matrix: { searchValue: 'true' }
                }
            })
            .then(function(response) {
                // expect(response.searchResponse[0].searchResult[0].recordList[0].record.length).toBe(pageSize);
                const records = response.searchResponse[0].searchResult[0].recordList[0].record;
                const matrixItemsNames = [];
                _(records).each(function(record) {
                    matrixItemsNames.push(record);
                    if (record.displayName) {
                        matrixItemsNames.push(record.displayName[0]);
                    }
                });
                // expect(itemNames.length > 0).toBe(true);
                console.log(`matrix parents found: ${matrixItemsNames}`);
                cb();
            })
            .catch(function(error) {
                expect('no errors expected').toBeFalsy();
                if (error) {
                    console.log(error.stack);
                    expect('should be no errors').toBe(false);
                }
                cb();
            });
    });
});
