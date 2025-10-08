import { addDays, addWeeks, getDay, isBefore, startOfWeek } from "date-fns";

import { getDB } from "@/src/__shared__/infrastructure/db";

export async function calculate(): Promise<void> {
	const prisma = getDB();
	const result = await prisma.order.aggregate({
		_min: {
			transactionDate: true,
		},
		_max: {
			transactionDate: true,
		},
	});
	const minDate = result._min.transactionDate;
	const maxDate = result._max.transactionDate;
	console.log("Min", minDate);
	console.log("Max", maxDate);

	const firstMonday = startOfWeek(minDate, { weekStartsOn: 1 });
	console.log(firstMonday);

	const days = Array<Date>();

	let currentDay = firstMonday;

	while (isBefore(currentDay, maxDate)) {
		const start = currentDay;
		const end = addDays(start, 1);
		days.push(start);
		currentDay = end;
	}
	console.log(firstMonday, maxDate, days.length);

	const weeks: { start: Date; end: Date }[] = [];
	let current = firstMonday;

	while (isBefore(current, maxDate)) {
		const start = current;
		const end = addWeeks(start, 1);
		weeks.push({ start, end });
		current = end;
	}
	console.log(weeks, weeks.length);
	/*
  FLOW
  Los compradores pagan a SeQura, no al merchant.
  ENTONCES SEQURA ADELANTE EL DINERO AL VENDEDOR Y SEQURA GESTIONA LA FINANZACION CON EL CLIENTE.
  Y en función de la configuracion del merchant le paga diariamente o semanalmente.
  Luego, SeQura paga a los merchants, pero no todos los días: depende de la frecuencia de desembolso de cada merchant (diaria o semanal).
  SeQura cobra una comisión sobre cada order, que depende del monto (total compra/valor producto). (la comision se cobra por cada order)

  Ejemplo:
    Juan compra un dyson con sequra. 
    Recibe el dyson en casa le de debe 500 euros a sequra. 
    Sequra le paga a dyson 500 euros - la comision del 0,85% lo descontamos de los 500 euros. Dyson recibe de sequra 495,75€ y squra gana 4,25 euros por la operacion.

  PARA CADAD PEDIDO SE CALCULA UNA COMISION  (muy importante)
     
  merchant tiene el dia live_on que es es el dia que paga para el tipo Weekly -> Hay que sacar el weekday del live_on del merchant, que es el dia de la semana que se paga.



  Tareas:
  Calculos de de fechas
  - Crear todos los rangos de semananas que hay entre la fecha min y max de la tabla orders
	- Crear un array con todas las fechas que hay entre el min y el max de la tabla orders

   
    DAILY
      Tengo merchants con el disbursementFrequency.DAILY
      Recuperar TODOS los merchants disbursementFrequency.DAILY
      Recuperar TODOS los orders de esa MERCHANT pendientes de pago (las procesadas las marcaremos con status proceded)

    WEEKLY
      Tengo merchants con el disbursementFrequency.WEEKLY
      Recuperar TODOS los merchants disbursementFrequency.WEEKLY


    Approach 1 Historico
      
      Recorrer dias de min a max (Crear un array con todas las fechas que hay entre el min y el max de la tabla orders)

        Por cada dia recorrer todos los merchants
        If merchant == DAILY {
            Hacemos query para obtener las ORDERS no PAGADAS que la fecha sea más antigua que el momento de ejecutar el job. (hay entra lo de 8:00 UTC > 10 am de barcelona)
            select * from ORDERS where merchant= and status=pending and transactionDate< HOY a las 8:00 UTC
            De aqui hemos sacado las orders que vamos a procesar en el desembolso para un determinado merchant.
            Calculamos por cada order su comision. Queremos saber que comision ha tenido cada ORDER a modo de consulta.
            Sumamos TODAS las ORDERS y restamos el total de comisiones pagadas.
            Queremos saber el TOTAL de desembolso sin comision y con comision para tenerlo como historico. (creamos tabla desembolso con toda esta info.)
            Marcamos la ORDEN con status = pagada para que no se vuelva a procesar.

            SQL: SELECT DISTINCT "transactionDate"	FROM public."order" order by 1; me salen 430 dias que hay pagos. eso quiere decir que no haría falta recorrer todos los días sino.
            podriamos iterar por esos 430 dias.
            Hemos creado metodo para recuperar todas las fechas
        }
        if mechant  == WEEKLY {
          El dia ACTUAL coincide con el live_on => entonces hay hacer desembolso y calculamos comisiones persistamos data etc..
          Inicialmente puedo recorrer el rango de semanas que hay entre el min y el max. (63 semanas me sale)

        if (El weekday coincide con el live_on del merchant || paga una vez a la semana)
          Comprueba si tiene alguna order 
    
        - Recorrer merchant 
        Es dia de pago?
            merchant del tipo daily, o que el dia de la semana actual 

        }
    

  */

	console.log(weeks);

	const daysNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	const merchants = await prisma.merchant.findMany();

	for (const merchant of merchants) {
		const element = merchant;
		const weekdayOfMerchant = daysNames[getDay(merchant.liveOn)];
		console.log(merchant.reference, merchant.liveOn, weekdayOfMerchant, getDay(merchant.liveOn));
	}
}

// for each merchant {
//   const frequency = merchant.disbursementFrequency;

//   if (frequency === 'DAILY' || (frequency === 'WEEKLY' && todayIsMerchantPayday(merchant))) {

//     const ordersToPay = getOrdersToPay(merchant, frequency);

//     const ordersWithCommission = ordersToPay.map(o => ({
//       ...o,
//       commission: calculateCommission(o.amount),
//       netAmount: o.amount - calculateCommission(o.amount),
//     }));

//     const totalGross = sum(o.amount for o in ordersWithCommission);
//     const totalCommission = sum(o.commission for o in ordersWithCommission);
//     const totalNet = totalGross - totalCommission;

//     const disbursement = {
//       reference: generateUniqueReference(),
//       merchantId: merchant.id,
//       date: today,
//       totalGross,
//       totalCommission,
//       payout: totalNet,
//       orders: ordersWithCommission.map(o => o.id),
//     };

//     // 6️⃣ Guardar disbursement y marcar orders como pagadas
//     saveDisbursement(disbursement);
//     markOrdersAsDisbursed(ordersToPay);
//   }
// }
