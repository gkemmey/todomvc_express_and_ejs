require 'rails'
require 'active_support/all'
require 'webpacker'
require 'json'

ENV["NODE_ENV"] ||= "development"
ENV["RAILS_ENV"] ||= ENV["NODE_ENV"]

task :environment do
  # do nothing, purposefully
end

Rails.application = OpenStruct.new \
                      config: OpenStruct.new(root: Pathname.new(File.expand_path(File.dirname(__FILE__))))

load File.join(Gem::Specification.find_by_name("railties").gem_dir, "lib/rails/tasks/framework.rake")

Dir[File.join(Gem::Specification.find_by_name("webpacker").gem_dir,
              "lib/tasks/**/*.rake")].each do |task|
  load task
end

# using standalone:
#
# 1. bundle exec rake -T should show webpacker tasks + app:update and app:template
# 2. `bundle exec rake app:udpdate:bin`
# 3. delete all but bin/rails
# 4. remove the `require_relative '../config/boot'` line
# 5. `bundle exec rake webpacker:install`
