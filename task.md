tanto para el reinicio de contraseniosa como para para el desbloqueo de momento usamos esta url "http://QASAP.diveco.intranet:8000/sap/bc/srt/rfc/sap/zsdsrv_webservice_srvusrsap/410/zws_srvusrsap/zbn_srvusrsap"

La autoriazacion almenos en postma usamos Basic Auth username "JOB_USER" y Password "Sapdiv+2024"

Como header le enviamos Content-Type text/xml;charset=UTF-8

Para el desbloeado le enviamos un body como este:
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
<urn:ZGLFU_WS_SRVUSERSAP>
<PC_ACCION>D</PC_ACCION>
<PC_EMAIL>erick.tecu.gt@camasolympia.com</PC_EMAIL>
<PC_USER>GT_ETECU</PC_USER>
</urn:ZGLFU_WS_SRVUSERSAP>
</soapenv:Body>
</soapenv:Envelope>

Obteniendo una respuesta como la siguiente:
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
<soap-env:Header/>
<soap-env:Body>
<n0:ZGLFU_WS_SRVUSERSAPResponse xmlns:n0="urn:sap-com:document:sap:rfc:functions">
<PC_MENSAJE>el usuario GT_ETECU ha sido desbloqueado con éxito.</PC_MENSAJE>
<PC_NOMBRE>Erick Tecu</PC_NOMBRE>
<PC_PASS/>
<PN_CODIGO>0</PN_CODIGO>
</n0:ZGLFU_WS_SRVUSERSAPResponse>
</soap-env:Body>
</soap-env:Envelope>

implementa la funcionalidad necesaria para poder realizar esta acccion mostranto un mensaje de exito cuano sea el caso.
