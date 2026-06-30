SELECT TOP (1000) [id]
      ,[name]
      ,[sku]
      ,[price]
      ,[stock]
      ,[description]
      ,[createdAt]
      ,[updatedAt]
      ,[categoryId]
      ,[expiryDate]
  FROM [PharmovaDB].[dbo].[Products]

  ALTER TABLE PharmovaDB.dbo.Products ADD imageUrl NVARCHAR(MAX);
