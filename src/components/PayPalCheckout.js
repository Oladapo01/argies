import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const PayPalButtonContainer = styled.div`
  margin-top: 1rem;
  min-height: 50px;
`;

const PayPalCheckout = ({ amount, currency = 'GBP', onSuccess, onError, onCancel }) => {
  const paypalRef = useRef();

  useEffect(() => {
    // Load PayPal script dynamically
    const loadPayPalScript = () => {
      return new Promise((resolve, reject) => {
        if (window.paypal) {
          resolve(window.paypal);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=${currency}`;
        script.async = true;
        script.onload = () => resolve(window.paypal);
        script.onerror = () => reject(new Error('PayPal SDK failed to load'));
        document.body.appendChild(script);
      });
    };

    loadPayPalScript()
      .then((paypal) => {
        if (paypalRef.current && !paypalRef.current.hasChildNodes()) {
          paypal
            .Buttons({
              style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal',
                height: 40
              },
              createOrder: (data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        currency_code: currency,
                        value: amount.toFixed(2)
                      },
                      description: 'Argies Bakery Order'
                    }
                  ]
                });
              },
              onApprove: async (data, actions) => {
                try {
                  const details = await actions.order.capture();
                  console.log('PayPal payment completed:', details);
                  onSuccess(details);
                } catch (error) {
                  console.error('PayPal payment error:', error);
                  onError(error);
                }
              },
              onCancel: (data) => {
                console.log('PayPal payment cancelled:', data);
                onCancel(data);
              },
              onError: (err) => {
                console.error('PayPal error:', err);
                onError(err);
              }
            })
            .render(paypalRef.current);
        }
      })
      .catch((error) => {
        console.error('Failed to load PayPal SDK:', error);
        onError(error);
      });
  }, [amount, currency, onSuccess, onError, onCancel]);

  return <PayPalButtonContainer ref={paypalRef} />;
};

export default PayPalCheckout;