require 'json'

require 'sinatra'
require 'sinatra-websocket'

def image(damage)
  "/img/iphone/cracked.jpg" if damage < 0

  case damage
  when 1..200
    "/img/iphone/001.png"
  when 201..500
    "/img/iphone/002.png"
  when 501..800
    "/img/iphone/003.png"
  when 801..1000
    "/img/iphone/004.png"
  end
end

def damage(weapon_name)
  case weapon_name
  when "shoes"
    damage = 10
  when "geta"
    damage = 20
  when "hammer"
    damage = 60
  when "powerhammer"
    damage = 100
  end

  random = Random.new
  damage * random.rand(75..100) / 100
end

class Toilet < Sinatra::Application
  set :hp, 1000
  set :sockets, []

  def initialize
    super

    @hp = 1000
  end

  get '/' do
    halt 404 unless request.websocket?

    request.websocket do |ws|
      ws.onopen do
        settings.sockets << ws

      end

      ws.onmessage do |message|
        request = JSON.parse(message, { symbolize_names: true })
        p request
        type = request.dig(:type)

        case type
        when "attack"
          if request.dig(:attack, :name) && request.dig(:attack, :weapon)
            attacker = request[:attack][:name]
            weapon = request[:attack][:weapon]
            damage_occured = damage(weapon)
            @hp -= damage_occured

            response_obj = {
              type: "status",
              status: {
                alive: true,
                image: image(damage_occured),
                last_attack: {
                  name: attacker,
                  damage: damage_occured
                }
              }
            }
            p response_obj
            p response = JSON.generate(response_obj)

            EM.next_tick {
              settings.sockets.each do |socket|
                socket.send(response)
              end
            }
          end
        end
      end

      ws.onclose do
        settings.sockets.delete(ws)
      end
    end

  end
end