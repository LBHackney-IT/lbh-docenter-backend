using Amazon.DynamoDBv2.DataModel;
using AutoFixture;
using DocenterApi.Tests.V1.Helper;
using DocenterApi.V1.Domain;
using DocenterApi.V1.Gateways;
using DocenterApi.V1.Infrastructure;
using FluentAssertions;
using Moq;
using NUnit.Framework;

namespace DocenterApi.Tests.V1.Gateways
{
    //TODO: Remove this file if DynamoDb gateway not being used
    //TODO: Rename Tests to match gateway name
    //For instruction on how to run tests please see the wiki: https://github.com/LBHackney-IT/lbh-docenter-api/wiki/Running-the-test-suite.
    [TestFixture]
    public class DynamoDbGatewayTests
    {
        private readonly Fixture _fixture = new Fixture();
        private Mock<IDynamoDBContext> _dynamoDb;
        private DynamoDbGateway _classUnderTest;

        [SetUp]
        public void Setup()
        {
            _dynamoDb = new Mock<IDynamoDBContext>();
            _classUnderTest = new DynamoDbGateway(_dynamoDb.Object);
        }

        [Test]
        public void GetEntityByIdReturnsNullIfEntityDoesntExist()
        {
            var response = _classUnderTest.GetEntityById(123);

            response.Should().BeNull();
        }

        [Test]
        public void GetEntityByIdReturnsTheEntityIfItExists()
        {
            var entity = _fixture.Create<Entity>();
            var dbEntity = DatabaseEntityHelper.CreateDatabaseEntityFrom(entity);

            _dynamoDb.Setup(x => x.LoadAsync<DatabaseEntity>(entity.Id, default))
                     .ReturnsAsync(dbEntity);

            var response = _classUnderTest.GetEntityById(entity.Id);

            _dynamoDb.Verify(x => x.LoadAsync<DatabaseEntity>(entity.Id, default), Times.Once);

            entity.Id.Should().Be(response.Id);
            entity.CreatedAt.Should().BeSameDateAs(response.CreatedAt);
        }
    }
}
