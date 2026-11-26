var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

test('invoice GST breakdown and total match the billed checkout calculation for an HSN-priced SAVE10 order', function () {
  var items = [
    { id: 4, sku: 'RICE-10', name: 'Rice', hsn: '1006', price: 100, qty: 6 }
  ];
  var checkout = pricing.computeTotals(items, 'SAVE10');
  var figures = invoice.computeInvoiceFigures({ items: items, coupon: 'SAVE10' });

  assert.deepEqual(checkout, {
    subtotal: 600,
    discount: 60,
    taxable: 540,
    tax: 27,
    cgst: 13.5,
    sgst: 13.5,
    total: 567,
    lines: [
      { id: 4, name: 'Rice', hsn: '1006', gstPercent: 5, gross: 600, discount: 60, taxable: 540, tax: 27, net: 567 }
    ]
  });
  assert.deepEqual(figures, {
    subtotal: 600,
    discount: 60,
    tax: 27,
    cgst: 13.5,
    sgst: 13.5,
    total: 567,
    rows: [
      { name: 'Rice', sku: 'RICE-10', hsn: '1006', qty: 6, price: 100, gstPercent: 5, line: 600, lineTax: 27 }
    ]
  });
});
