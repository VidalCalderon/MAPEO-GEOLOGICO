USE PLANTILLA_v13
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_ESTRUCTURAL__1K]'))
	DROP TRIGGER dbo.[TGRU_ESTRUCTURAL__1K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURAS (Lineas)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_ESTRUCTURAL__1K]
   ON  [dbo].[ESTRUCTURAL__1K]
   AFTER UPDATE
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vIntensidad nvarchar(60), @vInformacion nvarchar(60), @vTextura nvarchar(60), @vMovimiento nvarchar(60),
			@vRelleno nvarchar(60), @vAncho nvarchar(60), @vMena1 nvarchar(60), @vMena2 nvarchar(60),
			@vGanga1 nvarchar(60), @vGanga2 nvarchar(60), @vEstrlMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtTipo nvarchar(60), @vTxtsubtipo nvarchar(60), @vTxtIntensidad nvarchar(60),
			@vTxtInformacion nvarchar(60), @vTxtMovimiento nvarchar(60), @vTxtTextura nvarchar(60),
			@vTxtRelleno nvarchar(60), @vTxtAncho nvarchar(60), @vTxtMena1 nvarchar(80), @vTxtMena2 nvarchar(80),
			@vTxtGanga1 nvarchar(80), @vTxtGanga2 nvarchar(80), @vObjectID int, @vNullMovimiento nvarchar(60), @vNullTextura nvarchar(60), @vNullRelleno nvarchar(60),
			@vNullAncho nvarchar(60), @vNullMena1 nvarchar(60), @vNullMena2 nvarchar(60), @vNullGanga1 nvarchar(60),
			@vNullGanga2 nvarchar(60)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vIntensidad=INTENSIDAD, @vInformacion=INFORMACION, @vTextura=TEXTURA, @vMovimiento=MOVIMIENTO, @vRelleno=RELLENO,
			@vAncho=ANCHO, @vMena1=MENA1, @vMena2=MENA2, @vGanga1=GANGA1, @vGanga2=GANGA2, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=1
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			IF @vMovimiento='Inv'
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + '-' + @vTxtMovimiento
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 2 = Venilla (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=2
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__1K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__1K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno

			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Venilla-OxMn-' + @vInformacion
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Venilla-Calcita-' + @vInformacion
			ELSE SET @vCodRGB = 'Venilla-' + @vInformacion END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END
	
	/*** VALIDACION DE TIPO 3 = Vetas (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=3
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__1K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__1K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
					
			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Veta-OxMn-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Veta-Calcita-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE SET @vCodRGB = 'Veta-' + @vInformacion + ' ' + ISNULL(@vAncho,'') END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END

	/*** VALIDACION DE TIPO 4 = Ledge (label = TIPO + RELLENO,  RGB = TIPO) ***/
	IF @vTipo=4
	BEGIN
		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 5 = Sobreescurrimiento (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=5
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 6 = Zona de Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 7 = Zona de Fracturamiento (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 8 = Anticlinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=8
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 9 = Sinclinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 10 = Discordancia  (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 11 = Esquistosidad (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 12 = Laminación (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=12
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 13 = Escape de Fluidos (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=13
	BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			
			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo
		
		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE ESTRUCTURAL__1K SET ESTRL_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE ESTRUCTURAL__1K SET ESTRL_MAP=NULL, ESTILO_RGB=NULL,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_ESTRUCTURAL__2K]'))
	DROP TRIGGER dbo.[TGRU_ESTRUCTURAL__2K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURAS (Lineas)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_ESTRUCTURAL__2K]
   ON  [dbo].[ESTRUCTURAL__2K]
   AFTER UPDATE
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vIntensidad nvarchar(60), @vInformacion nvarchar(60), @vTextura nvarchar(60), @vMovimiento nvarchar(60),
			@vRelleno nvarchar(60), @vAncho nvarchar(60), @vMena1 nvarchar(60), @vMena2 nvarchar(60),
			@vGanga1 nvarchar(60), @vGanga2 nvarchar(60), @vEstrlMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtTipo nvarchar(60), @vTxtsubtipo nvarchar(60), @vTxtIntensidad nvarchar(60),
			@vTxtInformacion nvarchar(60), @vTxtMovimiento nvarchar(60), @vTxtTextura nvarchar(60),
			@vTxtRelleno nvarchar(60), @vTxtAncho nvarchar(60), @vTxtMena1 nvarchar(80), @vTxtMena2 nvarchar(80),
			@vTxtGanga1 nvarchar(80), @vTxtGanga2 nvarchar(80), @vObjectID int, @vNullMovimiento nvarchar(60), @vNullTextura nvarchar(60), @vNullRelleno nvarchar(60),
			@vNullAncho nvarchar(60), @vNullMena1 nvarchar(60), @vNullMena2 nvarchar(60), @vNullGanga1 nvarchar(60),
			@vNullGanga2 nvarchar(60)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vIntensidad=INTENSIDAD, @vInformacion=INFORMACION, @vTextura=TEXTURA, @vMovimiento=MOVIMIENTO, @vRelleno=RELLENO,
			@vAncho=ANCHO, @vMena1=MENA1, @vMena2=MENA2, @vGanga1=GANGA1, @vGanga2=GANGA2, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=1
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			IF @vMovimiento='Inv'
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + '-' + @vTxtMovimiento
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 2 = Venilla (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=2
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__2K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__2K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno

			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Venilla-OxMn-' + @vInformacion
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Venilla-Calcita-' + @vInformacion
			ELSE SET @vCodRGB = 'Venilla-' + @vInformacion END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END
	
	/*** VALIDACION DE TIPO 3 = Vetas (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=3
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__2K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__2K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
					
			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Veta-OxMn-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Veta-Calcita-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE SET @vCodRGB = 'Veta-' + @vInformacion + ' ' + ISNULL(@vAncho,'') END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END

	/*** VALIDACION DE TIPO 4 = Ledge (label = TIPO + RELLENO,  RGB = TIPO) ***/
	IF @vTipo=4
	BEGIN
		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 5 = Sobreescurrimiento (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=5
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 6 = Zona de Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 7 = Zona de Fracturamiento (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 8 = Anticlinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=8
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 9 = Sinclinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 10 = Discordancia  (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 11 = Esquistosidad (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 12 = Laminación (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=12
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 13 = Escape de Fluidos (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=13
	BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			
			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo
		
		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE ESTRUCTURAL__2K SET ESTRL_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE ESTRUCTURAL__2K SET ESTRL_MAP=NULL, ESTILO_RGB=NULL,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_ESTRUCTURAL__5K]'))
	DROP TRIGGER dbo.[TGRU_ESTRUCTURAL__5K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURAS (Lineas)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_ESTRUCTURAL__5K]
   ON  [dbo].[ESTRUCTURAL__5K]
   AFTER UPDATE
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vIntensidad nvarchar(60), @vInformacion nvarchar(60), @vTextura nvarchar(60), @vMovimiento nvarchar(60),
			@vRelleno nvarchar(60), @vAncho nvarchar(60), @vMena1 nvarchar(60), @vMena2 nvarchar(60),
			@vGanga1 nvarchar(60), @vGanga2 nvarchar(60), @vEstrlMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtTipo nvarchar(60), @vTxtsubtipo nvarchar(60), @vTxtIntensidad nvarchar(60),
			@vTxtInformacion nvarchar(60), @vTxtMovimiento nvarchar(60), @vTxtTextura nvarchar(60),
			@vTxtRelleno nvarchar(60), @vTxtAncho nvarchar(60), @vTxtMena1 nvarchar(80), @vTxtMena2 nvarchar(80),
			@vTxtGanga1 nvarchar(80), @vTxtGanga2 nvarchar(80), @vObjectID int, @vNullMovimiento nvarchar(60), @vNullTextura nvarchar(60), @vNullRelleno nvarchar(60),
			@vNullAncho nvarchar(60), @vNullMena1 nvarchar(60), @vNullMena2 nvarchar(60), @vNullGanga1 nvarchar(60),
			@vNullGanga2 nvarchar(60)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vIntensidad=INTENSIDAD, @vInformacion=INFORMACION, @vTextura=TEXTURA, @vMovimiento=MOVIMIENTO, @vRelleno=RELLENO,
			@vAncho=ANCHO, @vMena1=MENA1, @vMena2=MENA2, @vGanga1=GANGA1, @vGanga2=GANGA2, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=1
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			IF @vMovimiento='Inv'
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + '-' + @vTxtMovimiento
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 2 = Venilla (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=2
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__5K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__5K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno

			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Venilla-OxMn-' + @vInformacion
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Venilla-Calcita-' + @vInformacion
			ELSE SET @vCodRGB = 'Venilla-' + @vInformacion END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END
	
	/*** VALIDACION DE TIPO 3 = Vetas (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=3
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__5K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL__5K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
					
			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Veta-OxMn-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Veta-Calcita-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE SET @vCodRGB = 'Veta-' + @vInformacion + ' ' + ISNULL(@vAncho,'') END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END

	/*** VALIDACION DE TIPO 4 = Ledge (label = TIPO + RELLENO,  RGB = TIPO) ***/
	IF @vTipo=4
	BEGIN
		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 5 = Sobreescurrimiento (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=5
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 6 = Zona de Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 7 = Zona de Fracturamiento (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 8 = Anticlinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=8
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 9 = Sinclinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 10 = Discordancia  (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 11 = Esquistosidad (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 12 = Laminación (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=12
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 13 = Escape de Fluidos (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=13
	BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			
			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo
		
		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE ESTRUCTURAL__5K SET ESTRL_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE ESTRUCTURAL__5K SET ESTRL_MAP=NULL, ESTILO_RGB=NULL,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_ESTRUCTURAL_10K]'))
	DROP TRIGGER dbo.[TGRU_ESTRUCTURAL_10K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURAS (Lineas)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_ESTRUCTURAL_10K]
   ON  [dbo].[ESTRUCTURAL_10K]
   AFTER UPDATE
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vIntensidad nvarchar(60), @vInformacion nvarchar(60), @vTextura nvarchar(60), @vMovimiento nvarchar(60),
			@vRelleno nvarchar(60), @vAncho nvarchar(60), @vMena1 nvarchar(60), @vMena2 nvarchar(60),
			@vGanga1 nvarchar(60), @vGanga2 nvarchar(60), @vEstrlMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtTipo nvarchar(60), @vTxtsubtipo nvarchar(60), @vTxtIntensidad nvarchar(60),
			@vTxtInformacion nvarchar(60), @vTxtMovimiento nvarchar(60), @vTxtTextura nvarchar(60),
			@vTxtRelleno nvarchar(60), @vTxtAncho nvarchar(60), @vTxtMena1 nvarchar(80), @vTxtMena2 nvarchar(80),
			@vTxtGanga1 nvarchar(80), @vTxtGanga2 nvarchar(80), @vObjectID int, @vNullMovimiento nvarchar(60), @vNullTextura nvarchar(60), @vNullRelleno nvarchar(60),
			@vNullAncho nvarchar(60), @vNullMena1 nvarchar(60), @vNullMena2 nvarchar(60), @vNullGanga1 nvarchar(60),
			@vNullGanga2 nvarchar(60)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vIntensidad=INTENSIDAD, @vInformacion=INFORMACION, @vTextura=TEXTURA, @vMovimiento=MOVIMIENTO, @vRelleno=RELLENO,
			@vAncho=ANCHO, @vMena1=MENA1, @vMena2=MENA2, @vGanga1=GANGA1, @vGanga2=GANGA2, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=1
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			IF @vMovimiento='Inv'
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + '-' + @vTxtMovimiento
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 2 = Venilla (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=2
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_10K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_10K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno

			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Venilla-OxMn-' + @vInformacion
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Venilla-Calcita-' + @vInformacion
			ELSE SET @vCodRGB = 'Venilla-' + @vInformacion END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END
	
	/*** VALIDACION DE TIPO 3 = Vetas (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=3
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_10K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_10K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
					
			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Veta-OxMn-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Veta-Calcita-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE SET @vCodRGB = 'Veta-' + @vInformacion + ' ' + ISNULL(@vAncho,'') END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END

	/*** VALIDACION DE TIPO 4 = Ledge (label = TIPO + RELLENO,  RGB = TIPO) ***/
	IF @vTipo=4
	BEGIN
		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 5 = Sobreescurrimiento (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=5
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 6 = Zona de Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 7 = Zona de Fracturamiento (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 8 = Anticlinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=8
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 9 = Sinclinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 10 = Discordancia  (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 11 = Esquistosidad (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 12 = Laminación (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=12
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 13 = Escape de Fluidos (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=13
	BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			
			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo
		
		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE ESTRUCTURAL_10K SET ESTRL_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE ESTRUCTURAL_10K SET ESTRL_MAP=NULL, ESTILO_RGB=NULL,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_ESTRUCTURAL_25K]'))
	DROP TRIGGER dbo.[TGRU_ESTRUCTURAL_25K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURAS (Lineas)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_ESTRUCTURAL_25K]
   ON  [dbo].[ESTRUCTURAL_25K]
   AFTER UPDATE
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vIntensidad nvarchar(60), @vInformacion nvarchar(60), @vTextura nvarchar(60), @vMovimiento nvarchar(60),
			@vRelleno nvarchar(60), @vAncho nvarchar(60), @vMena1 nvarchar(60), @vMena2 nvarchar(60),
			@vGanga1 nvarchar(60), @vGanga2 nvarchar(60), @vEstrlMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtTipo nvarchar(60), @vTxtsubtipo nvarchar(60), @vTxtIntensidad nvarchar(60),
			@vTxtInformacion nvarchar(60), @vTxtMovimiento nvarchar(60), @vTxtTextura nvarchar(60),
			@vTxtRelleno nvarchar(60), @vTxtAncho nvarchar(60), @vTxtMena1 nvarchar(80), @vTxtMena2 nvarchar(80),
			@vTxtGanga1 nvarchar(80), @vTxtGanga2 nvarchar(80), @vObjectID int, @vNullMovimiento nvarchar(60), @vNullTextura nvarchar(60), @vNullRelleno nvarchar(60),
			@vNullAncho nvarchar(60), @vNullMena1 nvarchar(60), @vNullMena2 nvarchar(60), @vNullGanga1 nvarchar(60),
			@vNullGanga2 nvarchar(60)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vIntensidad=INTENSIDAD, @vInformacion=INFORMACION, @vTextura=TEXTURA, @vMovimiento=MOVIMIENTO, @vRelleno=RELLENO,
			@vAncho=ANCHO, @vMena1=MENA1, @vMena2=MENA2, @vGanga1=GANGA1, @vGanga2=GANGA2, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=1
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			IF @vMovimiento='Inv'
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + '-' + @vTxtMovimiento
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 2 = Venilla (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=2
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_25K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_25K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno

			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Venilla-OxMn-' + @vInformacion
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Venilla-Calcita-' + @vInformacion
			ELSE SET @vCodRGB = 'Venilla-' + @vInformacion END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END
	
	/*** VALIDACION DE TIPO 3 = Vetas (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=3
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_25K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_25K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
					
			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Veta-OxMn-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Veta-Calcita-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE SET @vCodRGB = 'Veta-' + @vInformacion + ' ' + ISNULL(@vAncho,'') END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END

	/*** VALIDACION DE TIPO 4 = Ledge (label = TIPO + RELLENO,  RGB = TIPO) ***/
	IF @vTipo=4
	BEGIN
		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 5 = Sobreescurrimiento (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=5
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 6 = Zona de Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 7 = Zona de Fracturamiento (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 8 = Anticlinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=8
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 9 = Sinclinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 10 = Discordancia  (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 11 = Esquistosidad (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 12 = Laminación (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=12
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 13 = Escape de Fluidos (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=13
	BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			
			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo
		
		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE ESTRUCTURAL_25K SET ESTRL_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE ESTRUCTURAL_25K SET ESTRL_MAP=NULL, ESTILO_RGB=NULL,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_ESTRUCTURAL_50K]'))
	DROP TRIGGER dbo.[TGRU_ESTRUCTURAL_50K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURAS (Lineas)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_ESTRUCTURAL_50K]
   ON  [dbo].[ESTRUCTURAL_50K]
   AFTER UPDATE
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vIntensidad nvarchar(60), @vInformacion nvarchar(60), @vTextura nvarchar(60), @vMovimiento nvarchar(60),
			@vRelleno nvarchar(60), @vAncho nvarchar(60), @vMena1 nvarchar(60), @vMena2 nvarchar(60),
			@vGanga1 nvarchar(60), @vGanga2 nvarchar(60), @vEstrlMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtTipo nvarchar(60), @vTxtsubtipo nvarchar(60), @vTxtIntensidad nvarchar(60),
			@vTxtInformacion nvarchar(60), @vTxtMovimiento nvarchar(60), @vTxtTextura nvarchar(60),
			@vTxtRelleno nvarchar(60), @vTxtAncho nvarchar(60), @vTxtMena1 nvarchar(80), @vTxtMena2 nvarchar(80),
			@vTxtGanga1 nvarchar(80), @vTxtGanga2 nvarchar(80), @vObjectID int, @vNullMovimiento nvarchar(60), @vNullTextura nvarchar(60), @vNullRelleno nvarchar(60),
			@vNullAncho nvarchar(60), @vNullMena1 nvarchar(60), @vNullMena2 nvarchar(60), @vNullGanga1 nvarchar(60),
			@vNullGanga2 nvarchar(60)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vIntensidad=INTENSIDAD, @vInformacion=INFORMACION, @vTextura=TEXTURA, @vMovimiento=MOVIMIENTO, @vRelleno=RELLENO,
			@vAncho=ANCHO, @vMena1=MENA1, @vMena2=MENA2, @vGanga1=GANGA1, @vGanga2=GANGA2, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=1
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			IF @vMovimiento='Inv'
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + '-' + @vTxtMovimiento
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 2 = Venilla (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=2
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_50K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_50K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno

			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Venilla-OxMn-' + @vInformacion
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Venilla-Calcita-' + @vInformacion
			ELSE SET @vCodRGB = 'Venilla-' + @vInformacion END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END
	
	/*** VALIDACION DE TIPO 3 = Vetas (label = TIPO + RELLENO,  RGB = MENA1 + GANGA1) ***/
	IF @vTipo=3
	BEGIN
		IF @vMena1 IS NOT NULL AND @vMena2 IS NOT NULL
		BEGIN
			IF @vMena1 = @vMena2
			BEGIN
				RAISERROR('ERROR: La MENA1 y la MENA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_50K SET MENA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vGanga1 IS NOT NULL AND @vGanga2 IS NOT NULL
		BEGIN
			IF @vGanga1 = @vGanga2
			BEGIN
				RAISERROR('ERROR: La GANGA1 y la GANGA2 no pueden ser iguales!',15,-1)
				UPDATE ESTRUCTURAL_50K SET GANGA2=NULL WHERE OBJECTID=@vObjectID
				RETURN
			END
		END

		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtMena1=MENA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMena1=CodMEN
			SELECT @vTxtGanga1=GANGA1 FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vGanga1=CodGAN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
					
			IF @vTxtMena1='Oxido Manganeso' SET @vCodRGB = 'Veta-OxMn-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE BEGIN IF @vTxtGanga1='Calcita' AND @vTxtMena1<>'Oxido Manganeso' SET @vCodRGB = 'Veta-Calcita-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
			ELSE SET @vCodRGB = 'Veta-' + @vInformacion + ' ' + ISNULL(@vAncho,'') END
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = @vMena1
		SET @vNullMena2 = @vMena2
		SET @vNullGanga1 = @vGanga1
		SET @vNullGanga2 = @vGanga2
	END

	/*** VALIDACION DE TIPO 4 = Ledge (label = TIPO + RELLENO,  RGB = TIPO) ***/
	IF @vTipo=4
	BEGIN
		IF @vRelleno IS NOT NULL
		BEGIN
			SELECT @vTxtRelleno=RELLENO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vRelleno=CodRNO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo +  '-' + @vTxtRelleno
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion + ' ' + ISNULL(@vAncho,'')
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = @vAncho
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 5 = Sobreescurrimiento (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=5
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 6 = Zona de Falla (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 7 = Zona de Fracturamiento (label = TIPO + MOVIMIENTO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		IF @vMovimiento IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtMovimiento=MOVIMIENTO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo AND @vMovimiento=CodMOV

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtMovimiento
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = @vMovimiento
		SET @vNullTextura = @vTextura
		SET @vNullRelleno = @vRelleno
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END
	
	/*** VALIDACION DE TIPO 8 = Anticlinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=8
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 9 = Sinclinal (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 10 = Discordancia  (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vInformacion IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vInformacion
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 11 = Esquistosidad (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 12 = Laminación (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=12
	BEGIN
		IF @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTextura
		END

		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	/*** VALIDACION DE TIPO 13 = Escape de Fluidos (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=13
	BEGIN
			SELECT @vTxtTipo=TIPO FROM ESTRUCTURALINEASCODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO
			
			SET @vCodLabel = @vTxtTipo
			SET @vCodRGB = @vTxtTipo
		
		SET @vNullMovimiento = NULL
		SET @vNullTextura = NULL
		SET @vNullRelleno = NULL
		SET @vNullAncho = NULL
		SET @vNullMena1 = NULL
		SET @vNullMena2 = NULL
		SET @vNullGanga1 = NULL
		SET @vNullGanga2 = NULL
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE ESTRUCTURAL_50K SET ESTRL_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE ESTRUCTURAL_50K SET ESTRL_MAP=NULL, ESTILO_RGB=NULL,
		MOVIMIENTO=@vNullMovimiento, TEXTURA=@vNullTextura, RELLENO=@vNullRelleno,
		ANCHO=@vNullAncho, MENA1=@vNullMena1, MENA2=@vNullMena2, GANGA1=@vNullGanga1,
		GANGA2=@vNullGanga2
		WHERE OBJECTID=@vObjectID
END