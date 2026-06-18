import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_1njpjyo";
const EMAILJS_TEMPLATE_ID = "template_oa5mbrl";

emailjs.init("Ih9J_nJ6MZrjkfVXc");

function _send(templateParams) {
  return emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      console.log("[EmailJS] Sent", templateParams.subject);
      return { success: true };
    })
    .catch((err) => {
      console.error("[EmailJS] Failed", err);
      return { success: false, error: err };
    });
}

export function sendLowStockAlert(product, managerEmail) {
  return _send({
    to_email: managerEmail,
    to_name: "Store Manager",
    subject: `Low Stock Alert - ${product.name}`,
    message:
      `This is an automated alert from your inventory system.\n\n` +
      `Product : ${product.name}\n` +
      `SKU     : ${product.sku || "N/A"}\n` +
      `Category: ${product.category || "N/A"}\n` +
      `Stock   : ${product.stock} units remaining\n\n` +
      `Please reorder soon to avoid a stockout.`,
  });
}

export function sendOrderConfirmation(order, customer) {
  const itemLines = order.items
    .map((i) => `  - ${i.name}  x${i.qty}  - Rs. ${i.price * i.qty}`)
    .join("\n");

  return _send({
    to_email: customer.email,
    to_name: customer.name,
    subject: `Order Confirmed - #${order.id}`,
    message:
      `Hi ${customer.name},\n\n` +
      `Thank you for your order! Here is your summary:\n\n` +
      `Order ID : #${order.id}\n` +
      `Date     : ${order.date || new Date().toLocaleDateString()}\n\n` +
      `Items:\n${itemLines}\n\n` +
      `Total    : Rs. ${order.total}\n\n` +
      `We will process your order shortly. Thank you for shopping with us!`,
  });
}

export function sendRestockNotification(product, customer) {
  return _send({
    to_email: customer.email,
    to_name: customer.name,
    subject: `Back in Stock - ${product.name}`,
    message:
      `Hi ${customer.name},\n\n` +
      `Great news! The item you were waiting for is back in stock:\n\n` +
      `Product : ${product.name}\n` +
      `SKU     : ${product.sku || "N/A"}\n` +
      `Price   : Rs. ${product.price}\n\n` +
      `Hurry - stock is limited. Place your order now!\n\n` +
      `Thank you for your patience.`,
  });
}

export function sendInvoice(invoice, customer) {
  const itemLines = invoice.items
    .map((i) => `  ${i.name} x${i.qty}   Rs. ${i.price * i.qty}`)
    .join("\n");

  return _send({
    to_email: customer.email,
    to_name: customer.name,
    subject: `Invoice #${invoice.id} - Payment Received`,
    message:
      `Hi ${customer.name},\n\n` +
      `Your payment has been received. Please find your invoice below:\n\n` +
      `Invoice # : ${invoice.id}\n` +
      `Date      : ${invoice.date || new Date().toLocaleDateString()}\n` +
      `Payment   : ${invoice.paymentMethod || "Cash"}\n\n` +
      `${itemLines}\n\n` +
      `Subtotal  : Rs. ${invoice.subtotal}\n` +
      `Tax (13%) : Rs. ${invoice.tax}\n` +
      `TOTAL     : Rs. ${invoice.total}\n\n` +
      `Thank you for your business!`,
  });
}

export function sendProductAddedAlert(product, managerEmail) {
  return _send({
    to_email: managerEmail,
    to_name: "Store Manager",
    subject: `New Product Added - ${product.name}`,
    message:
      `A new product has been added to the inventory:\n\n` +
      `Product  : ${product.name}\n` +
      `SKU      : ${product.sku || "N/A"}\n` +
      `Category : ${product.category || "N/A"}\n` +
      `Price    : Rs. ${product.price}\n` +
      `Stock    : ${product.stock} units\n` +
      `Added on : ${new Date().toLocaleDateString()}\n\n` +
      `Login to the inventory app to manage this product.`,
  });
}

export function sendStockUpdateAlert(
  product,
  oldStock,
  newStock,
  managerEmail,
) {
  const change = newStock - oldStock;
  const direction = change >= 0 ? `+${change} added` : `${change} removed`;

  return _send({
    to_email: managerEmail,
    to_name: "Store Manager",
    subject: `Stock Updated - ${product.name}`,
    message:
      `Stock has been manually updated in the inventory:\n\n` +
      `Product    : ${product.name}\n` +
      `SKU        : ${product.sku || "N/A"}\n` +
      `Old Stock  : ${oldStock} units\n` +
      `Change     : ${direction}\n` +
      `New Stock  : ${newStock} units\n` +
      `Updated on : ${new Date().toLocaleString()}\n\n` +
      `If this change was not authorized, please review your inventory immediately.`,
  });
}
