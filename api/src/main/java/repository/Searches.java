package repository;

import model.Search;
import model.Team;
import model.TimeInterval;

import java.awt.geom.Point2D;
import java.sql.Time;
import java.util.ArrayList;
import java.util.Date;

import java.text.ParseException;


import javax.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

public class Searches {
    private final EntityManager entityManager;

    public Searches(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Search createSearch(Team team, Date date, List<String> time, String latitude, String longitude, boolean isRecurring, int minAge, int maxAge) throws ParseException {
        Optional<Search> searchOptional = findSearchByTeam(Long.toString(team.getId()), time, date.getMonth(), date.getDate(), date.getYear(), latitude, longitude,  isRecurring, minAge, maxAge);
        if (searchOptional.isEmpty()) {
            final Search search = Search.create(team, date, time, latitude, longitude,  isRecurring,minAge,maxAge);

            entityManager.persist(search);
            return search;

        } else {
            reactivateSearch(team, time, date, latitude, longitude,  isRecurring,minAge,maxAge);
            return searchOptional.get();
        }
    }


    public List<Search> findActiveSearchesByTeamId(Long team_id) {
        return entityManager.createQuery("SELECT s FROM Search s WHERE(s.team.id =:team_id AND s.isSearching  =true AND s.isRecurring =false AND s.recurrentSearchId =-1)", Search.class)
                .setParameter("team_id", team_id)
                .getResultList();
    }

    public List<Search> findActiveRecurringMatchesByTeamId(Long teamId) {
        return entityManager.createQuery("SELECT s FROM Search s WHERE(s.team.id =:teamId AND s.isSearching =true AND s.isRecurring =true)", Search.class)
                .setParameter("teamId", teamId)
                .getResultList();
    }

    public List<Search> findCompatibleSearches(Long search_id) {
        Optional<Search> search = entityManager.createQuery("SELECT s FROM Search s WHERE s.id =:search_id", Search.class)
                .setParameter("search_id", search_id)
                .getResultList()
                .stream()
                .findFirst();

        return findCandidates(Long.toString(search.get().getTeam().getUserId()), search.get().getTime(), search.get().getDate(), search.get().getTeam().getSport(), search.get().getTeam().getQuantity(), search.get().getLatitude(), search.get().getLongitude(), search.get().getMinAge(), search.get().getMaxAge());
    }

    public boolean deactivateSearchBySearchId(Long search_id) {
        int updatedCount = entityManager.createQuery("UPDATE Search  set isSearching =false WHERE id = :search_id OR recurrentSearchId =:search_id")
                .setParameter("search_id", search_id)
                .executeUpdate();


        return updatedCount >0;

        //        if (!searches.isEmpty()){
        //            Search search = searches.get(0);
        //            search.cancelSearching();
        //            return true;
        //        }
    }

    public List<Search> findActiveSearchesByUserId(Long user_id) {
        return entityManager.createQuery("SELECT s FROM Search s WHERE(s.team.user.id =:user_id AND s.isSearching = true)", Search.class)
                .setParameter("user_id", user_id)
                .getResultList();
    }

    public Optional<Search> reactivateSearch(Team team, List<String> time, Date date, String latitude, String longitude,  boolean isRecurring, int minAge, int maxAge) {
        Optional<Search> search = findSearchByTeam(Long.toString(team.getId()), time, date.getMonth(), date.getDate(), date.getYear(), latitude, longitude, isRecurring,minAge,maxAge);
        if(search.isPresent() && search.get().searching()){
            return Optional.empty();
        }
        else{
            search.ifPresent(Search::reactivateSearching);
        }
        return search;
    }
    public boolean setRecurringSearchId(Long searchId, Long recurrentId){
        int updatedCount=0;
        updatedCount = entityManager.createQuery("UPDATE Search SET recurrentSearchId =:recurrentId WHERE id =:searchId")
                .setParameter("recurrentId",recurrentId)
                .setParameter("searchId",searchId)
                .executeUpdate();
        return updatedCount>0;
    }

    public boolean exists(String id, List<String> time, Date date, String latitude, String longitude,  boolean isRecurring, int minAge, int maxAge) {
        return findSearchByTeam(id, time, date.getMonth(), date.getDate(), date.getYear(), latitude, longitude,  isRecurring, minAge,maxAge).isPresent();
    }

//    public List<Search> findCandidatesWhenRecurring(String id, TimeInterval time, Date date, String sport, String quantity, String latitude, String longitude, int age) {
//        int weekDay = date.getDay();
//        List<Search> possibleCandidates = entityManager.createQuery("SELECT s FROM Search s WHERE (  s.date.weekDay =: weekDay AND cast(s.team.user.id as string) not LIKE :id AND s.team.sport LIKE :sport " +
//                        "AND s.team.quantity LIKE :quantity AND isSearching = true AND (s.averageAge BETWEEN :minAge AND :maxAge))", Search.class)
//                .setParameter("weekDay", weekDay)
//                .setParameter("sport", sport)
//                .setParameter("id", id)
//                .setParameter("quantity", quantity)
//                .setParameter("minAge", age - 10)
//                .setParameter("maxAge", age + 10)
//                .getResultList();
//        for (int i = 0; i < possibleCandidates.size(); i++) {
//            Search candidate = possibleCandidates.get(i);
//            if (!candidate.isRecurring()) {
//                if (candidate.getDate().getYear() < date.getYear()) {
//                    possibleCandidates.remove(candidate);
//                } else if (candidate.getDate().getYear() == date.getYear() && candidate.getDate().getMonth() < date.getMonth()) {
//                    possibleCandidates.remove(candidate);
//
//                } else if (candidate.getDate().getYear() == date.getYear() && candidate.getDate().getMonth() == date.getMonth() && candidate.getDate().getDate() < date.getDate()) {
//                    possibleCandidates.remove(candidate);
//
//                }
//            }
//        }
//        return filtrateCandidates(time, latitude, longitude, possibleCandidates);
//
//
//    }

    private List<Search> filtrateCandidates(TimeInterval time, String latitude, String longitude, List<Search> possibleCandidates) {
        List<Search> candidates = new ArrayList<>(possibleCandidates.size());
        for (int i = 0; i < possibleCandidates.size(); i++) {
            if (time.haveOneCoincidentTime(possibleCandidates.get(i).getTime().getIntervals())) {
                candidates.add(possibleCandidates.get(i));
            }
        }
        List<Search> finalCandidates = new ArrayList<>(candidates.size());
        for (Search candidate : candidates) {
            if (isInA5KmRadius(Double.parseDouble(latitude), Double.parseDouble(longitude), Double.parseDouble(candidate.getLatitude()), Double.parseDouble(candidate.getLongitude()))) {
                finalCandidates.add(candidate);
            }
        }
        return finalCandidates;
    }


    public List<Search> findCandidates(String id, TimeInterval time, model.Date date, String sport, String quantity, String latitude, String longitude, int minAge, int maxAge) {
        int month = date.getMonth();
        int day = date.getDate();
        int year = date.getYear();
        List<Search> possibleCandidates = entityManager.createQuery("SELECT s FROM Search s WHERE ( ( (s.isRecurring = false AND s.date.month =: month AND s.date.day =: day AND s.date.year=: year))" +
                        "AND cast(s.team.user.id as string) not LIKE :id AND s.team.sport LIKE :sport " +
                        "AND s.team.quantity LIKE :quantity AND isSearching = true AND NOT (:maxAge < s.minAge OR s.maxAge < :minAge))", Search.class)
                .setParameter("month", month)
                .setParameter("day", day)
                .setParameter("year", year)
                .setParameter("sport", sport)
                .setParameter("id", id)
                .setParameter("quantity", quantity)
                .setParameter("minAge", minAge)
                .setParameter("maxAge", maxAge)
                .getResultList();

        return filtrateCandidates(time, latitude, longitude, possibleCandidates);

    }

    public Optional<Search> getSearchById(Long searchId) {
        return entityManager.createQuery("SELECT s FROM Search s WHERE s.id = :searchId", Search.class)
                .setParameter("searchId", searchId)
                .getResultList().stream()
                .findFirst();
    }
    public List<Search> getSearchesByRecurringSearchId(Long recurringId){
        return entityManager.createQuery("SELECT s FROM Search s WHERE s.recurrentSearchId =:recurringId",Search.class)
                .setParameter("recurringId",recurringId)
                .getResultList();
    }

    public Search persist(Search search) {
        entityManager.persist(search);
        return search;
    }

    public List<Search> listAll() {
        return entityManager.createQuery("SELECT u FROM Search u", Search.class).getResultList();
    }

    public void deactivateSearchesByTeam(Long teamId) {
        entityManager.createQuery("UPDATE Search set isSearching = false WHERE team.id = :teamId")
                .setParameter("teamId", teamId)
                .executeUpdate();
    }

    private Optional<Search> findSearchByTeam(String team_id, List<String> time, int month, int day, int year, String latitude, String longitude,  boolean isRecurring, int minAge, int maxAge) {
        Optional<Search> search = entityManager.createQuery("SELECT s FROM Search s WHERE (cast(s.team.id as string) LIKE :team_id  AND isRecurring = :isRecurring AND s.date.day = :day AND s.date.month = :month AND s.date.year = :year AND s.latitude LIKE :latitude AND s.longitude LIKE :longitude AND s.minAge = :minAge AND s.maxAge = :maxAge)", Search.class)
                .setParameter("team_id", team_id)
                .setParameter("month", month)
                .setParameter("year", year)
                .setParameter("day", day)
                .setParameter("latitude", latitude)
                .setParameter("longitude", longitude)
                .setParameter("minAge",minAge)
                .setParameter("maxAge",maxAge)
                .setParameter("isRecurring", isRecurring)
                .getResultList()
                .stream()
                .findFirst();
        if (search.isPresent()) {
            TimeInterval timeInterval = search.get().getTime();
            if (timeInterval.listEqualsIgnoreOrder(time)) {
                return search;
            } else return Optional.empty();
        } else return Optional.empty();
    }

    private static boolean isInA5KmRadius(double lat1, double lon1, double lat2, double lon2) {
        //Haversine formula
        final int earthRadius = 6371; //

        double distLat = Math.toRadians(lat2 - lat1);
        double distLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(distLat / 2) * Math.sin(distLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(distLon / 2) * Math.sin(distLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double distance = earthRadius * c;

        return distance <= 5;
    }

    public Point2D.Double getMiddlePoint(String latitude1, String longitude1, String latitude2, String longitude2) {
        // Convertir las coordenadas de grados a radianes
        double lat1 = Math.toRadians(Double.parseDouble(latitude1));
        double lon1 = Math.toRadians(Double.parseDouble(longitude1));
        double lat2 = Math.toRadians(Double.parseDouble(latitude2));
        double lon2 = Math.toRadians(Double.parseDouble(longitude2));

        // Calcular el punto medio
        double bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
        double by = Math.cos(lat2) * Math.sin(lon2 - lon1);
        double lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by));
        double lon3 = lon1 + Math.atan2(by, Math.cos(lat1) + bx);

        // Convertir el resultado de radianes a grados
        double middleLatitude = Math.toDegrees(lat3);
        double middleLongitude = Math.toDegrees(lon3);

        // Crear y devolver el punto intermedio
        return new Point2D.Double(middleLatitude, middleLongitude);
    }

}