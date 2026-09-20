USE PLANTILLA_v13
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_LITOLOGIA__1K]'))
	DROP TRIGGER dbo.TGRU_LITOLOGIA__1K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de LITOLOGIA (UPDATE)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_LITOLOGIA__1K]
   ON  [dbo].[LITOLOGIA__1K]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60), @vTxtClasto nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int,
			@vNullSubtipo nvarchar(60), @vNullTextura nvarchar(60), @vNullComposicion nvarchar(60),
			@vNullForma nvarchar(60), @vNullFosiles nvarchar(60), @vNullCemento_MTZ nvarchar(60), @vMsgError varchar(180)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	--TIPO
	SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La FORMA y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END

		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM			
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo				
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END
	
	/*** VALIDACION DE TIPO 3 = Volcánico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 4 = Volcánico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 5 = Volcanoclástico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = NULL
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtCemento_MTZ=CEMENTO_MTZ FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vCemento_MTZ=CodCEM

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
		SET @vNullCemento_MTZ = @vCemento_MTZ
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL OR @vFormacion IS NOT NULL OR @vFosiles IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtFosiles=FOSILES FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFosiles=CodFOS

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la FORMACION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = @vFosiles
	END

	/*** VALIDACION DE TIPO 9 = Metamórfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	--Validando codigos en la base de datos
	IF @vTipo IS NOT NULL AND @vTxtTipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El TIPO ' + CAST(@vTipo AS VARCHAR(10)) + ' no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vSubtipo IS NOT NULL AND @vTxtSubtipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El SUBTIPO ' + @vSubtipo + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vTextura IS NOT NULL AND @vTxtTextura IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La TEXTURA ' + @vTextura + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vClasto IS NOT NULL AND @vTxtClasto IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El CLASTO ' + @vClasto + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vComposicion IS NOT NULL AND @vTxtComposicion IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La COMPOSICION ' + @vComposicion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vForma IS NOT NULL AND @vTxtForma IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La FORMA ' + @vForma + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vCemento_MTZ IS NOT NULL AND @vTxtCemento_MTZ IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El Cemento_MTZ ' + @vCemento_MTZ + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vFormacion IS NOT NULL
	BEGIN
		IF @vTipo <> 8
			SELECT @vTxtFormacion=NOMBRE FROM FORMACIONCODE WHERE CODIGO=@vFormacion

		IF @vTxtFormacion IS NULL
		BEGIN
			SET @vMsgError = 'ERROR: La FORMACION ' + @vFormacion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
			RAISERROR(@vMsgError,15,-1)
			ROLLBACK
			RETURN
		END		
	END
	IF @vFosiles IS NOT NULL AND @vTxtFosiles IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El FOSIL ' + @vFosiles + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END


	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA__1K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA__1K SET LITO_MAP=NULL, ESTILO_RGB=NULL,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_LITOLOGIA__2K]'))
	DROP TRIGGER dbo.TGRU_LITOLOGIA__2K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de LITOLOGIA (UPDATE)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_LITOLOGIA__2K]
   ON  [dbo].[LITOLOGIA__2K]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60), @vTxtClasto nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int,
			@vNullSubtipo nvarchar(60), @vNullTextura nvarchar(60), @vNullComposicion nvarchar(60),
			@vNullForma nvarchar(60), @vNullFosiles nvarchar(60), @vNullCemento_MTZ nvarchar(60), @vMsgError varchar(180)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	--TIPO
	SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La FORMA y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END

		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM			
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo				
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END
	
	/*** VALIDACION DE TIPO 3 = Volcánico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 4 = Volcánico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 5 = Volcanoclástico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = NULL
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtCemento_MTZ=CEMENTO_MTZ FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vCemento_MTZ=CodCEM

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
		SET @vNullCemento_MTZ = @vCemento_MTZ
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL OR @vFormacion IS NOT NULL OR @vFosiles IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtFosiles=FOSILES FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFosiles=CodFOS

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la FORMACION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = @vFosiles
	END

	/*** VALIDACION DE TIPO 9 = Metamórfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	--Validando codigos en la base de datos
	IF @vTipo IS NOT NULL AND @vTxtTipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El TIPO ' + CAST(@vTipo AS VARCHAR(10)) + ' no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vSubtipo IS NOT NULL AND @vTxtSubtipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El SUBTIPO ' + @vSubtipo + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vTextura IS NOT NULL AND @vTxtTextura IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La TEXTURA ' + @vTextura + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vClasto IS NOT NULL AND @vTxtClasto IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El CLASTO ' + @vClasto + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vComposicion IS NOT NULL AND @vTxtComposicion IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La COMPOSICION ' + @vComposicion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vForma IS NOT NULL AND @vTxtForma IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La FORMA ' + @vForma + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vCemento_MTZ IS NOT NULL AND @vTxtCemento_MTZ IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El Cemento_MTZ ' + @vCemento_MTZ + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vFormacion IS NOT NULL
	BEGIN
		IF @vTipo <> 8
			SELECT @vTxtFormacion=NOMBRE FROM FORMACIONCODE WHERE CODIGO=@vFormacion

		IF @vTxtFormacion IS NULL
		BEGIN
			SET @vMsgError = 'ERROR: La FORMACION ' + @vFormacion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
			RAISERROR(@vMsgError,15,-1)
			ROLLBACK
			RETURN
		END		
	END
	IF @vFosiles IS NOT NULL AND @vTxtFosiles IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El FOSIL ' + @vFosiles + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END


	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA__2K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA__2K SET LITO_MAP=NULL, ESTILO_RGB=NULL,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_LITOLOGIA__5K]'))
	DROP TRIGGER dbo.TGRU_LITOLOGIA__5K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de LITOLOGIA (UPDATE)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_LITOLOGIA__5K]
   ON  [dbo].[LITOLOGIA__5K]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60), @vTxtClasto nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int,
			@vNullSubtipo nvarchar(60), @vNullTextura nvarchar(60), @vNullComposicion nvarchar(60),
			@vNullForma nvarchar(60), @vNullFosiles nvarchar(60), @vNullCemento_MTZ nvarchar(60), @vMsgError varchar(180)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	--TIPO
	SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La FORMA y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END

		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM			
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo				
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END
	
	/*** VALIDACION DE TIPO 3 = Volcánico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 4 = Volcánico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 5 = Volcanoclástico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = NULL
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtCemento_MTZ=CEMENTO_MTZ FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vCemento_MTZ=CodCEM

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
		SET @vNullCemento_MTZ = @vCemento_MTZ
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL OR @vFormacion IS NOT NULL OR @vFosiles IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtFosiles=FOSILES FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFosiles=CodFOS

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la FORMACION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = @vFosiles
	END

	/*** VALIDACION DE TIPO 9 = Metamórfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	--Validando codigos en la base de datos
	IF @vTipo IS NOT NULL AND @vTxtTipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El TIPO ' + CAST(@vTipo AS VARCHAR(10)) + ' no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vSubtipo IS NOT NULL AND @vTxtSubtipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El SUBTIPO ' + @vSubtipo + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vTextura IS NOT NULL AND @vTxtTextura IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La TEXTURA ' + @vTextura + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vClasto IS NOT NULL AND @vTxtClasto IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El CLASTO ' + @vClasto + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vComposicion IS NOT NULL AND @vTxtComposicion IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La COMPOSICION ' + @vComposicion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vForma IS NOT NULL AND @vTxtForma IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La FORMA ' + @vForma + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vCemento_MTZ IS NOT NULL AND @vTxtCemento_MTZ IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El Cemento_MTZ ' + @vCemento_MTZ + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vFormacion IS NOT NULL
	BEGIN
		IF @vTipo <> 8
			SELECT @vTxtFormacion=NOMBRE FROM FORMACIONCODE WHERE CODIGO=@vFormacion

		IF @vTxtFormacion IS NULL
		BEGIN
			SET @vMsgError = 'ERROR: La FORMACION ' + @vFormacion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
			RAISERROR(@vMsgError,15,-1)
			ROLLBACK
			RETURN
		END		
	END
	IF @vFosiles IS NOT NULL AND @vTxtFosiles IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El FOSIL ' + @vFosiles + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END


	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA__5K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA__5K SET LITO_MAP=NULL, ESTILO_RGB=NULL,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_LITOLOGIA_10K]'))
	DROP TRIGGER dbo.TGRU_LITOLOGIA_10K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de LITOLOGIA (UPDATE)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_LITOLOGIA_10K]
   ON  [dbo].[LITOLOGIA_10K]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60), @vTxtClasto nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int,
			@vNullSubtipo nvarchar(60), @vNullTextura nvarchar(60), @vNullComposicion nvarchar(60),
			@vNullForma nvarchar(60), @vNullFosiles nvarchar(60), @vNullCemento_MTZ nvarchar(60), @vMsgError varchar(180)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	--TIPO
	SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La FORMA y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END

		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM			
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo				
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END
	
	/*** VALIDACION DE TIPO 3 = Volcánico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 4 = Volcánico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 5 = Volcanoclástico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = NULL
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtCemento_MTZ=CEMENTO_MTZ FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vCemento_MTZ=CodCEM

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
		SET @vNullCemento_MTZ = @vCemento_MTZ
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL OR @vFormacion IS NOT NULL OR @vFosiles IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtFosiles=FOSILES FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFosiles=CodFOS

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la FORMACION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = @vFosiles
	END

	/*** VALIDACION DE TIPO 9 = Metamórfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	--Validando codigos en la base de datos
	IF @vTipo IS NOT NULL AND @vTxtTipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El TIPO ' + CAST(@vTipo AS VARCHAR(10)) + ' no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vSubtipo IS NOT NULL AND @vTxtSubtipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El SUBTIPO ' + @vSubtipo + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vTextura IS NOT NULL AND @vTxtTextura IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La TEXTURA ' + @vTextura + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vClasto IS NOT NULL AND @vTxtClasto IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El CLASTO ' + @vClasto + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vComposicion IS NOT NULL AND @vTxtComposicion IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La COMPOSICION ' + @vComposicion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vForma IS NOT NULL AND @vTxtForma IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La FORMA ' + @vForma + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vCemento_MTZ IS NOT NULL AND @vTxtCemento_MTZ IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El Cemento_MTZ ' + @vCemento_MTZ + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vFormacion IS NOT NULL
	BEGIN
		IF @vTipo <> 8
			SELECT @vTxtFormacion=NOMBRE FROM FORMACIONCODE WHERE CODIGO=@vFormacion

		IF @vTxtFormacion IS NULL
		BEGIN
			SET @vMsgError = 'ERROR: La FORMACION ' + @vFormacion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
			RAISERROR(@vMsgError,15,-1)
			ROLLBACK
			RETURN
		END		
	END
	IF @vFosiles IS NOT NULL AND @vTxtFosiles IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El FOSIL ' + @vFosiles + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END


	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA_10K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA_10K SET LITO_MAP=NULL, ESTILO_RGB=NULL,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_LITOLOGIA_25K]'))
	DROP TRIGGER dbo.TGRU_LITOLOGIA_25K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de LITOLOGIA (UPDATE)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_LITOLOGIA_25K]
   ON  [dbo].[LITOLOGIA_25K]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60), @vTxtClasto nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int,
			@vNullSubtipo nvarchar(60), @vNullTextura nvarchar(60), @vNullComposicion nvarchar(60),
			@vNullForma nvarchar(60), @vNullFosiles nvarchar(60), @vNullCemento_MTZ nvarchar(60), @vMsgError varchar(180)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	--TIPO
	SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La FORMA y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END

		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM			
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo				
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END
	
	/*** VALIDACION DE TIPO 3 = Volcánico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 4 = Volcánico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 5 = Volcanoclástico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = NULL
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtCemento_MTZ=CEMENTO_MTZ FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vCemento_MTZ=CodCEM

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
		SET @vNullCemento_MTZ = @vCemento_MTZ
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL OR @vFormacion IS NOT NULL OR @vFosiles IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtFosiles=FOSILES FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFosiles=CodFOS

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la FORMACION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = @vFosiles
	END

	/*** VALIDACION DE TIPO 9 = Metamórfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	--Validando codigos en la base de datos
	IF @vTipo IS NOT NULL AND @vTxtTipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El TIPO ' + CAST(@vTipo AS VARCHAR(10)) + ' no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vSubtipo IS NOT NULL AND @vTxtSubtipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El SUBTIPO ' + @vSubtipo + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vTextura IS NOT NULL AND @vTxtTextura IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La TEXTURA ' + @vTextura + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vClasto IS NOT NULL AND @vTxtClasto IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El CLASTO ' + @vClasto + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vComposicion IS NOT NULL AND @vTxtComposicion IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La COMPOSICION ' + @vComposicion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vForma IS NOT NULL AND @vTxtForma IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La FORMA ' + @vForma + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vCemento_MTZ IS NOT NULL AND @vTxtCemento_MTZ IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El Cemento_MTZ ' + @vCemento_MTZ + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vFormacion IS NOT NULL
	BEGIN
		IF @vTipo <> 8
			SELECT @vTxtFormacion=NOMBRE FROM FORMACIONCODE WHERE CODIGO=@vFormacion

		IF @vTxtFormacion IS NULL
		BEGIN
			SET @vMsgError = 'ERROR: La FORMACION ' + @vFormacion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
			RAISERROR(@vMsgError,15,-1)
			ROLLBACK
			RETURN
		END		
	END
	IF @vFosiles IS NOT NULL AND @vTxtFosiles IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El FOSIL ' + @vFosiles + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END


	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA_25K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA_25K SET LITO_MAP=NULL, ESTILO_RGB=NULL,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRU_LITOLOGIA_50K]'))
	DROP TRIGGER dbo.TGRU_LITOLOGIA_50K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de LITOLOGIA (UPDATE)
-- =============================================
CREATE TRIGGER [dbo].[TGRU_LITOLOGIA_50K]
   ON  [dbo].[LITOLOGIA_50K]
   AFTER UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60), @vTxtClasto nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int,
			@vNullSubtipo nvarchar(60), @vNullTextura nvarchar(60), @vNullComposicion nvarchar(60),
			@vNullForma nvarchar(60), @vNullFosiles nvarchar(60), @vNullCemento_MTZ nvarchar(60), @vMsgError varchar(180)

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	--TIPO
	SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La FORMA y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END

		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM			
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo				
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = NULL
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END
	
	/*** VALIDACION DE TIPO 3 = Volcánico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 4 = Volcánico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la COMPOSICION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 5 = Volcanoclástico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: La COMPOSICION es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = NULL
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtCemento_MTZ=CEMENTO_MTZ FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vCemento_MTZ=CodCEM

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
		SET @vNullCemento_MTZ = @vCemento_MTZ
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vForma IS NOT NULL OR @vComposicion IS NOT NULL OR @vTextura IS NOT NULL OR @vFormacion IS NOT NULL OR @vFosiles IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtFosiles=FOSILES FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFosiles=CodFOS

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO y la FORMACION son datos obligatorios!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = @vComposicion
		SET @vNullForma = @vForma
		SET @vNullFosiles = @vFosiles
	END

	/*** VALIDACION DE TIPO 9 = Metamórfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL OR @vTextura IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTextura=TEXTURA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vTextura=CodTXT
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
		--ELSE
		--BEGIN
		--	RAISERROR('ERROR: El SUBTIPO es un dato obligatorio!',15,-1)
		--	ROLLBACK TRANSACTION
		--	RETURN
		--END
		SET @vNullSubtipo = @vSubtipo
		SET @vNullTextura = @vTextura
		SET @vNullComposicion = NULL
		SET @vNullForma = @vForma
		SET @vNullFosiles = NULL
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo

		SET @vNullSubtipo = NULL
		SET @vNullTextura = NULL
		SET @vNullComposicion = NULL
		SET @vNullForma = NULL
		SET @vNullFosiles = NULL
	END

	--Validando codigos en la base de datos
	IF @vTipo IS NOT NULL AND @vTxtTipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El TIPO ' + CAST(@vTipo AS VARCHAR(10)) + ' no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vSubtipo IS NOT NULL AND @vTxtSubtipo IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El SUBTIPO ' + @vSubtipo + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vTextura IS NOT NULL AND @vTxtTextura IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La TEXTURA ' + @vTextura + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vClasto IS NOT NULL AND @vTxtClasto IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El CLASTO ' + @vClasto + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vComposicion IS NOT NULL AND @vTxtComposicion IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La COMPOSICION ' + @vComposicion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vForma IS NOT NULL AND @vTxtForma IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: La FORMA ' + @vForma + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vCemento_MTZ IS NOT NULL AND @vTxtCemento_MTZ IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El Cemento_MTZ ' + @vCemento_MTZ + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END
	IF @vFormacion IS NOT NULL
	BEGIN
		IF @vTipo <> 8
			SELECT @vTxtFormacion=NOMBRE FROM FORMACIONCODE WHERE CODIGO=@vFormacion

		IF @vTxtFormacion IS NULL
		BEGIN
			SET @vMsgError = 'ERROR: La FORMACION ' + @vFormacion + ' (' + @vTxtTipo + ') no existe en la base de datos!'
			RAISERROR(@vMsgError,15,-1)
			ROLLBACK
			RETURN
		END		
	END
	IF @vFosiles IS NOT NULL AND @vTxtFosiles IS NULL 
	BEGIN
		SET @vMsgError = 'ERROR: El FOSIL ' + @vFosiles + ' (' + @vTxtTipo + ') no existe en la base de datos!'
		RAISERROR(@vMsgError,15,-1)
		ROLLBACK
		RETURN
	END


	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA_50K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA_50K SET LITO_MAP=NULL, ESTILO_RGB=NULL,
			SUBTIPO=@vNullSubtipo, TEXTURA=@vNullTextura, COMPOSICION=@vNullComposicion,
			FORMA=@vNullForma, FOSILES=@vNullFosiles
		WHERE OBJECTID=@vObjectID
END