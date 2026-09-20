USE PLANTILLA_v13
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_SIMBOLOSESTRL__1K]'))
	DROP TRIGGER dbo.[TGRI_SIMBOLOSESTRL__1K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURA (Puntos)
-- =============================================
CREATE TRIGGER [dbo].[TGRI_SIMBOLOSESTRL__1K]
   ON  [dbo].[SIMBOLOSESTRL__1K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vEste numeric(18,8), @vNorte numeric(18,8), @vCota numeric(18,8), @vDipDir smallint,
			@vDip smallint, @vAncho numeric(18,3), @vSimbMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vObjectID int, @vEsteCalc numeric(18,8),
			@vNorteCalc numeric(18,8), @vShape geometry

	SELECT @vTipo=TIPO, @vEste=ESTE, @vNorte=NORTE, @vCota=COTA, @vDipDir=DIP_DIR, @vDip=DIP, @vAncho=ANCHO,
		@vShape=SHAPE, @vObjectID=OBJECTID
	FROM inserted

	IF @vTipo = 1 SET @vCodRGB='Falla'
	IF @vTipo = 2 SET @vCodRGB='Venillas (<10cm)'
	IF @vTipo = 3 SET @vCodRGB='Veta (>10cm)'
	IF @vTipo = 4 SET @vCodRGB='Ledge'
	IF @vTipo = 5 SET @vCodRGB='Estrato'
	IF @vTipo = 6 SET @vCodRGB='Fractura'
	IF @vTipo = 7 SET @vCodRGB='Foliacion'
	IF @vTipo = 8 SET @vCodRGB='Flow Banding'
	IF @vTipo = 9 SET @vCodRGB='Dique'
	IF @vTipo = 10 SET @vCodRGB='Dextral'
	IF @vTipo = 11 SET @vCodRGB='Sinestral'
	IF @vTipo = 12 SET @vCodRGB='Anticlinal'
	IF @vTipo = 13 SET @vCodRGB='Sinclinal'
	IF @vTipo = 14 SET @vCodRGB='Anticlinal Tumbado'
	IF @vTipo = 15 SET @vCodRGB='Sinclinal Tumbado'
	IF @vTipo = 16 SET @vCodRGB='Buzamiento Invertido'
	IF @vTipo = 17 SET @vCodRGB='Brecha'

	
	IF @vShape IS NOT NULL
	BEGIN
		IF @vEste IS NULL SET @vEsteCalc = @vShape.STX ELSE SET @vEsteCalc = NULL
		IF @vNorte IS NULL SET @vNorteCalc = @vShape.STY ELSE SET @vNorteCalc = NULL
	END

	UPDATE SIMBOLOSESTRL__1K SET SIMB_MAP=CAST(@vDip AS varchar(60)), ESTILO_RGB=@vCodRGB,
		ESTE=@vEsteCalc, NORTE=@vNorteCalc
	WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_SIMBOLOSESTRL__2K]'))
	DROP TRIGGER dbo.[TGRI_SIMBOLOSESTRL__2K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURA (Puntos)
-- =============================================
CREATE TRIGGER [dbo].[TGRI_SIMBOLOSESTRL__2K]
   ON  [dbo].[SIMBOLOSESTRL__2K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vEste numeric(18,8), @vNorte numeric(18,8), @vCota numeric(18,8), @vDipDir smallint,
			@vDip smallint, @vAncho numeric(18,3), @vSimbMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vObjectID int, @vEsteCalc numeric(18,8),
			@vNorteCalc numeric(18,8), @vShape geometry

	SELECT @vTipo=TIPO, @vEste=ESTE, @vNorte=NORTE, @vCota=COTA, @vDipDir=DIP_DIR, @vDip=DIP, @vAncho=ANCHO,
		@vShape=SHAPE, @vObjectID=OBJECTID
	FROM inserted

	IF @vTipo = 1 SET @vCodRGB='Falla'
	IF @vTipo = 2 SET @vCodRGB='Venillas (<10cm)'
	IF @vTipo = 3 SET @vCodRGB='Veta (>10cm)'
	IF @vTipo = 4 SET @vCodRGB='Ledge'
	IF @vTipo = 5 SET @vCodRGB='Estrato'
	IF @vTipo = 6 SET @vCodRGB='Fractura'
	IF @vTipo = 7 SET @vCodRGB='Foliacion'
	IF @vTipo = 8 SET @vCodRGB='Flow Banding'
	IF @vTipo = 9 SET @vCodRGB='Dique'
	IF @vTipo = 10 SET @vCodRGB='Dextral'
	IF @vTipo = 11 SET @vCodRGB='Sinestral'
	IF @vTipo = 12 SET @vCodRGB='Anticlinal'
	IF @vTipo = 13 SET @vCodRGB='Sinclinal'
	IF @vTipo = 14 SET @vCodRGB='Anticlinal Tumbado'
	IF @vTipo = 15 SET @vCodRGB='Sinclinal Tumbado'
	IF @vTipo = 16 SET @vCodRGB='Buzamiento Invertido'
	IF @vTipo = 17 SET @vCodRGB='Brecha'

	
	IF @vShape IS NOT NULL
	BEGIN
		IF @vEste IS NULL SET @vEsteCalc = @vShape.STX ELSE SET @vEsteCalc = NULL
		IF @vNorte IS NULL SET @vNorteCalc = @vShape.STY ELSE SET @vNorteCalc = NULL
	END

	UPDATE SIMBOLOSESTRL__2K SET SIMB_MAP=CAST(@vDip AS varchar(60)), ESTILO_RGB=@vCodRGB,
		ESTE=@vEsteCalc, NORTE=@vNorteCalc
	WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_SIMBOLOSESTRL__5K]'))
	DROP TRIGGER dbo.[TGRI_SIMBOLOSESTRL__5K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURA (Puntos)
-- =============================================
CREATE TRIGGER [dbo].[TGRI_SIMBOLOSESTRL__5K]
   ON  [dbo].[SIMBOLOSESTRL__5K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vEste numeric(18,8), @vNorte numeric(18,8), @vCota numeric(18,8), @vDipDir smallint,
			@vDip smallint, @vAncho numeric(18,3), @vSimbMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vObjectID int, @vEsteCalc numeric(18,8),
			@vNorteCalc numeric(18,8), @vShape geometry

	SELECT @vTipo=TIPO, @vEste=ESTE, @vNorte=NORTE, @vCota=COTA, @vDipDir=DIP_DIR, @vDip=DIP, @vAncho=ANCHO,
		@vShape=SHAPE, @vObjectID=OBJECTID
	FROM inserted

	IF @vTipo = 1 SET @vCodRGB='Falla'
	IF @vTipo = 2 SET @vCodRGB='Venillas (<10cm)'
	IF @vTipo = 3 SET @vCodRGB='Veta (>10cm)'
	IF @vTipo = 4 SET @vCodRGB='Ledge'
	IF @vTipo = 5 SET @vCodRGB='Estrato'
	IF @vTipo = 6 SET @vCodRGB='Fractura'
	IF @vTipo = 7 SET @vCodRGB='Foliacion'
	IF @vTipo = 8 SET @vCodRGB='Flow Banding'
	IF @vTipo = 9 SET @vCodRGB='Dique'
	IF @vTipo = 10 SET @vCodRGB='Dextral'
	IF @vTipo = 11 SET @vCodRGB='Sinestral'
	IF @vTipo = 12 SET @vCodRGB='Anticlinal'
	IF @vTipo = 13 SET @vCodRGB='Sinclinal'
	IF @vTipo = 14 SET @vCodRGB='Anticlinal Tumbado'
	IF @vTipo = 15 SET @vCodRGB='Sinclinal Tumbado'
	IF @vTipo = 16 SET @vCodRGB='Buzamiento Invertido'
	IF @vTipo = 17 SET @vCodRGB='Brecha'

	
	IF @vShape IS NOT NULL
	BEGIN
		IF @vEste IS NULL SET @vEsteCalc = @vShape.STX ELSE SET @vEsteCalc = NULL
		IF @vNorte IS NULL SET @vNorteCalc = @vShape.STY ELSE SET @vNorteCalc = NULL
	END

	UPDATE SIMBOLOSESTRL__5K SET SIMB_MAP=CAST(@vDip AS varchar(60)), ESTILO_RGB=@vCodRGB,
		ESTE=@vEsteCalc, NORTE=@vNorteCalc
	WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_SIMBOLOSESTRL_10K]'))
	DROP TRIGGER dbo.[TGRI_SIMBOLOSESTRL_10K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURA (Puntos)
-- =============================================
CREATE TRIGGER [dbo].[TGRI_SIMBOLOSESTRL_10K]
   ON  [dbo].[SIMBOLOSESTRL_10K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vEste numeric(18,8), @vNorte numeric(18,8), @vCota numeric(18,8), @vDipDir smallint,
			@vDip smallint, @vAncho numeric(18,3), @vSimbMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vObjectID int, @vEsteCalc numeric(18,8),
			@vNorteCalc numeric(18,8), @vShape geometry

	SELECT @vTipo=TIPO, @vEste=ESTE, @vNorte=NORTE, @vCota=COTA, @vDipDir=DIP_DIR, @vDip=DIP, @vAncho=ANCHO,
		@vShape=SHAPE, @vObjectID=OBJECTID
	FROM inserted

	IF @vTipo = 1 SET @vCodRGB='Falla'
	IF @vTipo = 2 SET @vCodRGB='Venillas (<10cm)'
	IF @vTipo = 3 SET @vCodRGB='Veta (>10cm)'
	IF @vTipo = 4 SET @vCodRGB='Ledge'
	IF @vTipo = 5 SET @vCodRGB='Estrato'
	IF @vTipo = 6 SET @vCodRGB='Fractura'
	IF @vTipo = 7 SET @vCodRGB='Foliacion'
	IF @vTipo = 8 SET @vCodRGB='Flow Banding'
	IF @vTipo = 9 SET @vCodRGB='Dique'
	IF @vTipo = 10 SET @vCodRGB='Dextral'
	IF @vTipo = 11 SET @vCodRGB='Sinestral'
	IF @vTipo = 12 SET @vCodRGB='Anticlinal'
	IF @vTipo = 13 SET @vCodRGB='Sinclinal'
	IF @vTipo = 14 SET @vCodRGB='Anticlinal Tumbado'
	IF @vTipo = 15 SET @vCodRGB='Sinclinal Tumbado'
	IF @vTipo = 16 SET @vCodRGB='Buzamiento Invertido'
	IF @vTipo = 17 SET @vCodRGB='Brecha'

	
	IF @vShape IS NOT NULL
	BEGIN
		IF @vEste IS NULL SET @vEsteCalc = @vShape.STX ELSE SET @vEsteCalc = NULL
		IF @vNorte IS NULL SET @vNorteCalc = @vShape.STY ELSE SET @vNorteCalc = NULL
	END

	UPDATE SIMBOLOSESTRL_10K SET SIMB_MAP=CAST(@vDip AS varchar(60)), ESTILO_RGB=@vCodRGB,
		ESTE=@vEsteCalc, NORTE=@vNorteCalc
	WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_SIMBOLOSESTRL_25K]'))
	DROP TRIGGER dbo.[TGRI_SIMBOLOSESTRL_25K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURA (Puntos)
-- =============================================
CREATE TRIGGER [dbo].[TGRI_SIMBOLOSESTRL_25K]
   ON  [dbo].[SIMBOLOSESTRL_25K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vEste numeric(18,8), @vNorte numeric(18,8), @vCota numeric(18,8), @vDipDir smallint,
			@vDip smallint, @vAncho numeric(18,3), @vSimbMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vObjectID int, @vEsteCalc numeric(18,8),
			@vNorteCalc numeric(18,8), @vShape geometry

	SELECT @vTipo=TIPO, @vEste=ESTE, @vNorte=NORTE, @vCota=COTA, @vDipDir=DIP_DIR, @vDip=DIP, @vAncho=ANCHO,
		@vShape=SHAPE, @vObjectID=OBJECTID
	FROM inserted

	IF @vTipo = 1 SET @vCodRGB='Falla'
	IF @vTipo = 2 SET @vCodRGB='Venillas (<10cm)'
	IF @vTipo = 3 SET @vCodRGB='Veta (>10cm)'
	IF @vTipo = 4 SET @vCodRGB='Ledge'
	IF @vTipo = 5 SET @vCodRGB='Estrato'
	IF @vTipo = 6 SET @vCodRGB='Fractura'
	IF @vTipo = 7 SET @vCodRGB='Foliacion'
	IF @vTipo = 8 SET @vCodRGB='Flow Banding'
	IF @vTipo = 9 SET @vCodRGB='Dique'
	IF @vTipo = 10 SET @vCodRGB='Dextral'
	IF @vTipo = 11 SET @vCodRGB='Sinestral'
	IF @vTipo = 12 SET @vCodRGB='Anticlinal'
	IF @vTipo = 13 SET @vCodRGB='Sinclinal'
	IF @vTipo = 14 SET @vCodRGB='Anticlinal Tumbado'
	IF @vTipo = 15 SET @vCodRGB='Sinclinal Tumbado'
	IF @vTipo = 16 SET @vCodRGB='Buzamiento Invertido'
	IF @vTipo = 17 SET @vCodRGB='Brecha'

	
	IF @vShape IS NOT NULL
	BEGIN
		IF @vEste IS NULL SET @vEsteCalc = @vShape.STX ELSE SET @vEsteCalc = NULL
		IF @vNorte IS NULL SET @vNorteCalc = @vShape.STY ELSE SET @vNorteCalc = NULL
	END

	UPDATE SIMBOLOSESTRL_25K SET SIMB_MAP=CAST(@vDip AS varchar(60)), ESTILO_RGB=@vCodRGB,
		ESTE=@vEsteCalc, NORTE=@vNorteCalc
	WHERE OBJECTID=@vObjectID
END
GO

IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[TGRI_SIMBOLOSESTRL_50K]'))
	DROP TRIGGER dbo.[TGRI_SIMBOLOSESTRL_50K]
GO

/*** CREANDO TRIGGER ****/
-- =============================================
-- Author:		Marlon Leandro
-- Create date: 10/03/2017
-- Description:	Controlar registro de mapeo de ESTRUCTURA (Puntos)
-- =============================================
CREATE TRIGGER [dbo].[TGRI_SIMBOLOSESTRL_50K]
   ON  [dbo].[SIMBOLOSESTRL_50K]
   AFTER INSERT
AS 
BEGIN	
	DECLARE @vTipo smallint, @vEste numeric(18,8), @vNorte numeric(18,8), @vCota numeric(18,8), @vDipDir smallint,
			@vDip smallint, @vAncho numeric(18,3), @vSimbMap nvarchar(80), @vEstiloRGB nvarchar(60),
			@vCodLabel nvarchar(80), @vCodRGB nvarchar(60), @vObjectID int, @vEsteCalc numeric(18,8),
			@vNorteCalc numeric(18,8), @vShape geometry

	SELECT @vTipo=TIPO, @vEste=ESTE, @vNorte=NORTE, @vCota=COTA, @vDipDir=DIP_DIR, @vDip=DIP, @vAncho=ANCHO,
		@vShape=SHAPE, @vObjectID=OBJECTID
	FROM inserted

	IF @vTipo = 1 SET @vCodRGB='Falla'
	IF @vTipo = 2 SET @vCodRGB='Venillas (<10cm)'
	IF @vTipo = 3 SET @vCodRGB='Veta (>10cm)'
	IF @vTipo = 4 SET @vCodRGB='Ledge'
	IF @vTipo = 5 SET @vCodRGB='Estrato'
	IF @vTipo = 6 SET @vCodRGB='Fractura'
	IF @vTipo = 7 SET @vCodRGB='Foliacion'
	IF @vTipo = 8 SET @vCodRGB='Flow Banding'
	IF @vTipo = 9 SET @vCodRGB='Dique'
	IF @vTipo = 10 SET @vCodRGB='Dextral'
	IF @vTipo = 11 SET @vCodRGB='Sinestral'
	IF @vTipo = 12 SET @vCodRGB='Anticlinal'
	IF @vTipo = 13 SET @vCodRGB='Sinclinal'
	IF @vTipo = 14 SET @vCodRGB='Anticlinal Tumbado'
	IF @vTipo = 15 SET @vCodRGB='Sinclinal Tumbado'
	IF @vTipo = 16 SET @vCodRGB='Buzamiento Invertido'
	IF @vTipo = 17 SET @vCodRGB='Brecha'

	
	IF @vShape IS NOT NULL
	BEGIN
		IF @vEste IS NULL SET @vEsteCalc = @vShape.STX ELSE SET @vEsteCalc = NULL
		IF @vNorte IS NULL SET @vNorteCalc = @vShape.STY ELSE SET @vNorteCalc = NULL
	END

	UPDATE SIMBOLOSESTRL_50K SET SIMB_MAP=CAST(@vDip AS varchar(60)), ESTILO_RGB=@vCodRGB,
		ESTE=@vEsteCalc, NORTE=@vNorteCalc
	WHERE OBJECTID=@vObjectID
END