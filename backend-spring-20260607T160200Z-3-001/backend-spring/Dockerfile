# ===== Etape 1 : build du jar avec Maven =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache des dependances : on copie d'abord le pom seul.
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Puis le code source et le build.
COPY src ./src
RUN mvn -q -B -DskipTests clean package

# ===== Etape 2 : image d'execution legere (JRE) =====
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
