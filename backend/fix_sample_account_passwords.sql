USE pollution_db;
GO

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE dbo.NguoiDung
    SET mat_khau_hash = '$2b$10$ld20gh8mVzOIAJKdJrJkyeRP5j9Qp3nOf1j8gKgn/rD132Tzon6Pa'
    WHERE LOWER(LTRIM(RTRIM(email))) IN (
        'an.nguyen@gmail.com',
        'bich.tran@gmail.com',
        'nam.le@gmail.com',
        'tuan.canbo@dongthap.gov.vn',
        'oanh.canbo@dongthap.gov.vn',
        'hung.quanly@dongthap.gov.vn'
    );

    IF @@ROWCOUNT <> 6
        THROW 51000, 'Expected exactly 6 sample accounts in dbo.NguoiDung.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
