
import com.google.common.base.Strings;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.gson.Gson;
import com.sun.tools.jconsole.JConsoleContext;
import json.JsonParser;
import model.*;
import repository.Searches;
import repository.Teams;
import repository.Users;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.Persistence;
import java.text.ParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static java.util.concurrent.TimeUnit.MINUTES;
import static json.JsonParser.toJson;
import static spark.Spark.*;

public class Routes {
    public static final String REGISTER_ROUTE = "/register";
    public static final String USERS_ROUTE = "/users";
    public static final String USER_ROUTE = "/user";
    public static final String AUTH_ROUTE = "/auth";
    public static final String PICK_TEAM_ROUTE = "/pickTeam";
    public static final String NEW_TEAM_ROUTE = "/newTeam";
    public static final String HOME_ROUTE = "/home";
    public static final String FIND_RIVAL_ROUTE = "/findRival";
    public static final String GET_TEAM_BY_ID_ROUTE = "/getTeamById";
    public static final String NEW_SEARCH_ROUTE = "/newSearch";


    private MySystem system;
    private static final Gson gson = new Gson();
    private final EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("rmatch");


    public void create(MySystem system) {
        this.system = system;
        routes();
    }

    private void routes() {
        before((req, resp) -> {
            resp.header("Access-Control-Allow-Origin", "*");
            resp.header("Access-Control-Allow-Headers", "*");
            resp.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH, OPTIONS");
        });
        options("/*", (req, resp) -> {
            resp.status(200);
            return "ok";
        });
        post(NEW_TEAM_ROUTE, (req, res) -> {

            getUser(req).ifPresentOrElse(
                    (user) -> {
                        final CreateTeamForm form = CreateTeamForm.createFromJson(req.body());

                        system.createTeam(form, user).ifPresentOrElse(
                                (team) -> {
                                    res.status(201);
                                    res.body("team created");
                                },
                                () -> {
                                    res.status(409);
                                    res.body("Team name already in use");
                                }
                        );
                    },
                    () -> {
                        res.status(409);
                    }
            );
            return res.body();

        });
        storedBasicUser(entityManagerFactory);
        storedBasicTeam(entityManagerFactory);

        post(REGISTER_ROUTE, (req, res) -> {
            final RegistrationUserForm form = RegistrationUserForm.createFromJson(req.body());

            system.registerUser(form).ifPresentOrElse(
                    (user) -> {
                        res.status(201);
                        res.body("user created");
                    },
                    () -> {
                        res.status(409);
                        res.body("username or email already exists");
                    }
            );

            return res.body();
        });
        post(AUTH_ROUTE, (req, res) -> {
            final AuthRequest authReq = AuthRequest.createFromJson(req.body());
            authenticate(authReq)
                    .ifPresentOrElse(token -> {
                        res.status(201);
                        String j = toJson(Auth.create(token));
                        res.body(j);
                        System.out.println(j);
                    }, () -> {
                        res.status(401);
                        res.body("");
                    });

            return res.body();
        });
        authorizedDelete(AUTH_ROUTE, (req, res) -> {
            getToken(req)
                    .ifPresentOrElse(token -> {
                        emailByToken.invalidate(token);
                        res.status(204);
                    }, () -> {
                        res.status(404);
                    });
            return "";

        });
        authorizedGet(USERS_ROUTE, (req, res) -> {
            final List<User> users = system.listUsers();
            return JsonParser.toJson(users);
        });
        get(PICK_TEAM_ROUTE, (req, res) -> {
            final EntityManager entityManager = entityManagerFactory.createEntityManager();
            final Teams teams = new Teams(entityManager);
            Optional<User> user = getUser(req);
            if (user.isPresent()) {
                String id = user.get().getId().toString();
                List<Team> teamList = teams.findTeamsByUserId(id);
                if (teamList.isEmpty()) {
                    res.status(204);
                    res.body("no teams yet");
                    return res.body();
                } else return gson.toJson(teamList);
            } else {
                return "";
            }
        });
        authorizedGet(USER_ROUTE, (req, res) -> {
            getUser(req).ifPresentOrElse(
                    (user) -> {
                        res.status(200);
                        res.body(user.asJson());
                    },
                    () -> {
                        res.status(404);
                        res.body("Invalid Token");
                    }
            );
            return toJson(res.body());
        });
        authorizedGet(GET_TEAM_BY_ID_ROUTE, (req, res) -> {
            final String id = (req.queryParams("id"));
            final EntityManager entityManager = entityManagerFactory.createEntityManager();
            final Teams teams = new Teams(entityManager);
            teams.findTeamsById(id).ifPresentOrElse(
                    (team) -> {
                        res.status(200);
                        res.body(JsonParser.toJson(team));
                    },
                    () -> {
                        res.status(404);
                        res.body("Invalid Token");
                    }
            );
            return toJson(res.body());
        });
        Spark.get("/getAllUsers", "application/json", (req, resp) -> {
            resp.type("application/json");
            resp.status(200);
            final EntityManager entityManager = entityManagerFactory.createEntityManager();
            final Users users = new Users(entityManager);

//            try {
//
//            }catch (SQL) {
//                resp.status(409);
//                resp.body("ee");
//            }
            return gson.toJson(users.listAll());
        });
//        authorizedGet(FIND_RIVAL_ROUTE, (req, res) -> {
//            final String id = (req.queryParams("id"));
//            final EntityManager entityManager = entityManagerFactory.createEntityManager();
//            final Searches searches=new Searches(entityManager);
//            final CreateSearchForm searchForm = CreateSearchForm.createFromJson(req.body());
//            List<Team> candidates = searches.findCandidates(id,searchForm.getTime(),searchForm.getDate().toString());
//            return gson.toJson(candidates);
//        });
        post(NEW_SEARCH_ROUTE, (req, res) -> {
            final EntityManager entityManager = entityManagerFactory.createEntityManager();
            final Searches searches = new Searches(entityManager);
            final Teams teams = new Teams(entityManager);
            final String id = (req.queryParams("id"));
            Optional<User> user = getUser(req);

            teams.findTeamsById(id).ifPresent(
                    (team) -> {
                        final CreateSearchForm searchForm = CreateSearchForm.createFromJson(req.body());
                        system.createSearch(searchForm,team).ifPresentOrElse(
                                (search) ->{
                                    res.status(201);
                                },
                                ()->{
                                    res.status(401);
                                    res.body("Search not created");
                                }
                        );
                        if (user.isPresent()){
                            String user_id = user.get().getId().toString();
                            List<Team> candidates =searches.findCandidates(user_id,searchForm.getTime(),searchForm.getDate(),team.getSport(),team.getQuantity());
                            res.body(JsonParser.toJson(candidates));

                        }

                    }
            );
            return res.body();
        });
    }

    private void authorizedGet(final String path, final Route route) {
        get(path, (request, response) -> authorize(route, request, response));
    }

    private void authorizedDelete(final String path, final Route route) {
        delete(path, (request, response) -> authorize(route, request, response));
    }

    private void authorizedPost(final String path, final Route route) {
        post(path, (request, response) -> authorize(route, request, response));
    }


    private Object authorize(Route route, Request request, Response response) throws Exception {
        if (isAuthorized(request)) {
            return route.handle(request, response);
        } else {
            response.status(401);
            return "Unauthorized";
        }
    }

    private Optional<User> getUser(Request req) {
        return getToken(req)
                .map(emailByToken::getIfPresent)
                .flatMap(email -> system.findUserByEmail(email));
    }

    private final Cache<String, String> emailByToken = CacheBuilder.newBuilder()
            .expireAfterAccess(30, MINUTES)
            .build();

    private Optional<String> authenticate(AuthRequest req) {
        return system.findUserByEmail(req.getEmail()).flatMap(foundUser -> {
            if (system.validPassword(req.getPassword(), foundUser)) {
                final String token = UUID.randomUUID().toString();
                emailByToken.put(token, foundUser.getEmail());
                return Optional.of(token);
            } else {
                return Optional.empty();
            }
        });
    }

    private boolean isAuthorized(Request request) {
        return getToken(request).map(this::isAuthenticated).orElse(false);
    }

    private static Optional<String> getToken(Request request) {
        return Optional.ofNullable(request.headers("Authorization"))
                .map(Routes::getTokenFromHeader);
    }

    private static String getTokenFromHeader(String authorizationHeader) {
        return authorizationHeader.replace("Bearer ", "");
    }

    private boolean isAuthenticated(String token) {
        return emailByToken.getIfPresent(token) != null;
    }

    private static void storedBasicUser(EntityManagerFactory entityManagerFactory) {
        final EntityManager entityManager = entityManagerFactory.createEntityManager();
        final Users users = new Users(entityManager);

        EntityTransaction tx = entityManager.getTransaction();
        tx.begin();
        if (users.listAll().isEmpty()) {
            final User kate =
                    User.create("catuchi22@river.com", "91218", "Catuchi", "Ghi", "cghi");
            final User coke =
                    User.create("cocaL@depo.com", "1234", "Coke", "Lasa", "clasa");

            final User fercho =
                    User.create("ferpalacios@remix.com", "4321", "Fercho", "Palacios", "ferpa");

            users.persist(kate);
            users.persist(coke);
            users.persist(fercho);
        }
        tx.commit();
        entityManager.close();
    }

    private static void storedBasicTeam(EntityManagerFactory entityManagerFactory) {
        final EntityManager entityManager = entityManagerFactory.createEntityManager();
        final Teams teams = new Teams(entityManager);
        final Users users = new Users(entityManager);
        List<User> userList = users.listAll();
        EntityTransaction tx = entityManager.getTransaction();
        tx.begin();
        if (teams.listAll().isEmpty()) {
            final Team kateTeam =
                    Team.create("river", "Football", "11", 0, "Young", "Pilar", userList.get(0));
            final Team cocaTeam =
                    Team.create("depo", "Football", "11", 0, "Young", "Pilar", userList.get(1));
            teams.persist(kateTeam);
            teams.persist(cocaTeam);
        }
        tx.commit();
        entityManager.close();
    }

    private static String capitalized(String name) {
        return Strings.isNullOrEmpty(name) ? name : name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();
    }

}







