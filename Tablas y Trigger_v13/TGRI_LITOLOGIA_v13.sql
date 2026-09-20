USE PLANTILLA_v13
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_LITOLOGIA__1K]'))
	DROP TRIGGER dbo.TGRI_LITOLOGIA__1K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2020
-- Description:	Controlar registro de mapeo de LITOLOGIA
-- =============================================
CREATE TRIGGER [dbo].[TGRI_LITOLOGIA__1K]
   ON  [dbo].[LITOLOGIA__1K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(80), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtClasto nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo			
		END
	END
	
	/*** VALIDACION DE TIPO 3 = Volc�nico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 4 = Volc�nico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 5 = Volcanocl�stico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vFormacion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 9 = Metam�rfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA__1K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA__1K SET LITO_MAP=NULL, ESTILO_RGB=NULL WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_LITOLOGIA__2K]'))
	DROP TRIGGER dbo.TGRI_LITOLOGIA__2K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2020
-- Description:	Controlar registro de mapeo de LITOLOGIA
-- =============================================
CREATE TRIGGER [dbo].[TGRI_LITOLOGIA__2K]
   ON  [dbo].[LITOLOGIA__2K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(80), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtClasto nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo			
		END
	END
	
	/*** VALIDACION DE TIPO 3 = Volc�nico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 4 = Volc�nico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 5 = Volcanocl�stico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vFormacion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 9 = Metam�rfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA__2K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA__2K SET LITO_MAP=NULL, ESTILO_RGB=NULL WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_LITOLOGIA__5K]'))
	DROP TRIGGER dbo.TGRI_LITOLOGIA__5K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2020
-- Description:	Controlar registro de mapeo de LITOLOGIA
-- =============================================
CREATE TRIGGER [dbo].[TGRI_LITOLOGIA__5K]
   ON  [dbo].[LITOLOGIA__5K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(80), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtClasto nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo			
		END
	END
	
	/*** VALIDACION DE TIPO 3 = Volc�nico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 4 = Volc�nico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 5 = Volcanocl�stico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vFormacion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 9 = Metam�rfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA__5K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA__5K SET LITO_MAP=NULL, ESTILO_RGB=NULL WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_LITOLOGIA_10K]'))
	DROP TRIGGER dbo.TGRI_LITOLOGIA_10K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2020
-- Description:	Controlar registro de mapeo de LITOLOGIA
-- =============================================
CREATE TRIGGER [dbo].[TGRI_LITOLOGIA_10K]
   ON  [dbo].[LITOLOGIA_10K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(80), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtClasto nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo			
		END
	END
	
	/*** VALIDACION DE TIPO 3 = Volc�nico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 4 = Volc�nico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 5 = Volcanocl�stico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vFormacion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 9 = Metam�rfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA_10K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA_10K SET LITO_MAP=NULL, ESTILO_RGB=NULL WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_LITOLOGIA_25K]'))
	DROP TRIGGER dbo.TGRI_LITOLOGIA_25K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2020
-- Description:	Controlar registro de mapeo de LITOLOGIA
-- =============================================
CREATE TRIGGER [dbo].[TGRI_LITOLOGIA_25K]
   ON  [dbo].[LITOLOGIA_25K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(80), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtClasto nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo			
		END
	END
	
	/*** VALIDACION DE TIPO 3 = Volc�nico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 4 = Volc�nico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 5 = Volcanocl�stico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vFormacion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 9 = Metam�rfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA_25K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA_25K SET LITO_MAP=NULL, ESTILO_RGB=NULL WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_LITOLOGIA_50K]'))
	DROP TRIGGER dbo.TGRI_LITOLOGIA_50K
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2020
-- Description:	Controlar registro de mapeo de LITOLOGIA
-- =============================================
CREATE TRIGGER [dbo].[TGRI_LITOLOGIA_50K]
   ON  [dbo].[LITOLOGIA_50K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vSubtipo nvarchar(60), @vTextura nvarchar(60), @vClasto nvarchar(60), @vComposicion nvarchar(60),
			@vForma nvarchar(60), @vFosiles nvarchar(60), @vFormacion nvarchar(60), @vCemento_MTZ nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(80), @vTxtSubtipo nvarchar(60),
			@vTxtTextura nvarchar(60), @vTxtClasto nvarchar(60), @vTxtComposicion nvarchar(60), @vTxtForma nvarchar(60),
			@vTxtFosiles nvarchar(60), @vTxtFormacion nvarchar(60), @vTxtCemento_MTZ nvarchar(60), @vTxtTipo nvarchar(80), @vObjectID int

	SELECT @vTipo=TIPO, @vSubtipo=SUBTIPO, @vTextura=TEXTURA, @vClasto=CLASTO, @vComposicion=COMPOSICION, @vForma=FORMA,
			@vFosiles=FOSILES, @vFormacion=FORMACION, @vCemento_MTZ=CEMENTO_MTZ, @vObjectID=OBJECTID
	FROM inserted
	
	/*** VALIDACION DE TIPO 1 = Subvolcanico (label = FORMA + COMPOSICION,  RGB = FORMA) ***/
	IF @vTipo=1
	BEGIN
		IF @vForma IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtForma=FORMA FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vForma=CodFOR
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM

			SET @vCodLabel = @vTxtForma + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtForma
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'SubVolc-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 2 = Intrusivo (label = COMPOSICION,  RGB = TIPO) ***/
	IF @vTipo=2
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtComposicion
			SET @vCodRGB = @vTxtTipo			
		END
	END
	
	/*** VALIDACION DE TIPO 3 = Volc�nico Coherente (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=3
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 4 = Volc�nico Fragmental (label = SUBTIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=4
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtSubtipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 5 = Volcanocl�stico (label = TIPO + COMPOSICION,  RGB = TIPO + COMPOSICION) ***/
	IF @vTipo=5
	BEGIN
		IF @vComposicion IS NOT NULL
		BEGIN
			SELECT @vTxtComposicion=COMPOSICION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vComposicion=CodCOM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtComposicion
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtComposicion
		END
	END

	/*** VALIDACION DE TIPO 6 = Brecha (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=6
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 7 = Vitreo (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=7
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	/*** VALIDACION DE TIPO 8 = Sedimentario (label = FORMACION + SUBTIPO,  RGB = FORMACION) ***/
	IF @vTipo=8
	BEGIN
		IF @vSubtipo IS NOT NULL AND @vFormacion IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtFormacion=FORMACION FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vFormacion=CodFRM
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtFormacion + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtFormacion
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Sed-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 9 = Metam�rfico (label = SUBTIPO,  RGB = SUBTIPO) ***/
	IF @vTipo=9
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB

			SET @vCodLabel = @vTxtSubtipo
			SET @vCodRGB = @vTxtSubtipo
			IF @vCodRGB = 'Indiferenciado' SET @vCodRGB = 'Meta-Indiferenciado'
		END
	END

	/*** VALIDACION DE TIPO 10 = Cuaternario (label = TIPO + SUBTIPO,  RGB = TIPO) ***/
	IF @vTipo=10
	BEGIN
		IF @vSubtipo IS NOT NULL
		BEGIN
			SELECT @vTxtSubtipo=SUBTIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo AND @vSubtipo=CodSUB
			SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

			SET @vCodLabel = @vTxtTipo + '-' + @vTxtSubtipo
			SET @vCodRGB = @vTxtTipo + '-' + @vTxtSubtipo
		END
	END

	/*** VALIDACION DE TIPO 11 = Obliterado (label = TIPO,  RGB = TIPO) ***/
	IF @vTipo=11
	BEGIN
		SELECT @vTxtTipo=TIPO FROM LITOLOGIACODE WHERE CodTIPO=@vTipo GROUP BY CodTIPO, TIPO

		SET @vCodLabel = @vTxtTipo
		SET @vCodRGB = @vTxtTipo
	END

	IF @vCodLabel IS NOT NULL AND @vCodRGB IS NOT NULL
		UPDATE LITOLOGIA_50K SET LITO_MAP=@vCodLabel, ESTILO_RGB=@vCodRGB WHERE OBJECTID=@vObjectID
	ELSE
		UPDATE LITOLOGIA_50K SET LITO_MAP=NULL, ESTILO_RGB=NULL WHERE OBJECTID=@vObjectID
END