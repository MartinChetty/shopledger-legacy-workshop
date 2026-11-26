var test = require('node:test');
var assert = require('node:assert/strict');

var coupons = require('../lib/coupons');
var pricing = require('../lib/pricing');
var tax = require('../lib/tax');
var invoice = require('../lib/invoice');

function hsnItems() {
  return [
    { id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 2 },
    { id: 2, name: 'Ghee', hsn: '0405', price: 100, qty: 1 }
  ];
}

test('checkout totals use the configured HSN GST rates for each line', function () {
  var totals = pricing.computeTotals(hsnItems(), '');

  assert.equal(tax.getRateForItem(hsnItems()[0]), 0.05);
  assert.equal(tax.getRateForItem(hsnItems()[1]), 0.12);
  assert.deepEqual(totals, {
    subtotal: 300,
    discount: 0,
    taxable: 300,
    tax: 22,
    cgst: 11,
    sgst: 11,
    total: 322,
    lines: [
      { id: 1, name: 'Rice', hsn: '1006', gstPercent: 5, gross: 200, discount: 0, taxable: 200, tax: 10, net: 210 },
      { id: 2, name: 'Ghee', hsn: '0405', gstPercent: 12, gross: 100, discount: 0, taxable: 100, tax: 12, net: 112 }
    ]
  });
});

test('SAVE10 applies at 10 percent and caps its checkout discount at 150', function () {
  assert.deepEqual(coupons.validate(' save10 ', 500), {
    valid: true,
    code: 'SAVE10',
    discount: 50,
    coupon: {
      type: 'percent',
      value: 10,
      minOrder: 500,
      maxDiscount: 150,
      active: true,
      description: '10% off on orders above ₹500 (max ₹150)'
    }
  });
  assert.equal(coupons.calculateDiscount(2500, 'SAVE10'), 150);
});

test('checkout rounds coupon discount, taxable amount, GST, and CGST/SGST per current implementation', function () {
  var totals = pricing.computeTotals([
    { id: 3, name: 'Rice pouch', hsn: '1006', price: 19.99, qty: 3 }
  ], 'WELCOME');

  assert.deepEqual(totals, {
    subtotal: 59.97,
    discount: 3,
    taxable: 56.97,
    tax: 2.85,
    cgst: 1.43,
    sgst: 1.42,
    total: 59.82,
    lines: [
      { id: 3, name: 'Rice pouch', hsn: '1006', gstPercent: 5, gross: 59.97, discount: 3, taxable: 56.97, tax: 2.85, net: 59.82 }
    ]
  });
});

test('invoice figures match checkout totals for an HSN-priced SAVE10 order without gstRate', function () {
  var items = [
    { id: 4, sku: 'RICE-10', name: 'Rice', hsn: '1006', price: 100, qty: 6 }
  ];
  var checkout = pricing.computeTotals(items, 'SAVE10');
  var figures = invoice.computeInvoiceFigures({
    items: items,
    coupon: 'SAVE10',
    total: checkout.total
  });

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
  assert.equal(pricing.round2(figures.total - checkout.total), 0);
});
