export const checkoutMock = {
    eventName: 'Campus Jazz Night',
    eventMonth: 'Nov',
    eventDay: '14',
    eventDayLabel: 'Sat',
    eventTime: '7:00 PM',
    venue: 'Great Hall, KNUST',
    ticketType: 'Regular',
    quantity: 2,
    unitPrice: 40,
    serviceFee: 0,
    currentStep: 1,
    totalSteps: 2,
}

export const formatCurrency = (amount: number) =>
    `GHS ${amount.toFixed(2)}`

export const checkoutSubtotal =
    checkoutMock.unitPrice * checkoutMock.quantity

export const checkoutTotal =
    checkoutSubtotal + checkoutMock.serviceFee